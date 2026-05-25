import pulp


class SupplyChainOptimizer:
    def __init__(self, demand_nodes, candidate_hubs, distances, demands, fixed_costs, handling_costs, capacities=None,
                 eligibilities=None, transport_rate=0.15, penalty_benchmarks=None):
        self.I = demand_nodes
        self.J = candidate_hubs
        self.d = distances  # dict: (i, j) -> distance
        self.demand = demands  # dict: i -> tons
        self.f = fixed_costs  # dict: j -> cost
        self.v = handling_costs  # dict: j -> unit handling cost
        self.cap = capacities  # dict: j -> tons
        self.elig = eligibilities  # dict: (i, j) -> 1 or 0

        # 1. Calculate base transport costs
        self.c = {(i, j): self.d[i, j] * transport_rate for i in self.I for j in self.J}

        # 2. Inject Penalty Benchmarks (Fallback to defaults if not provided)
        penalties = penalty_benchmarks or {}
        self.cost_3pl = penalties.get("flex_3pl_overflow_cost_usd_per_ton", 120)
        self.cost_sla = penalties.get("sla_breach_penalty_usd_per_ton", 500)

    # 1. UFLP Engine (S1): Uncapacitated Facility Location Problem
    def solve_uflp(self, scenario_name):
        prob = pulp.LpProblem(scenario_name, pulp.LpMinimize)
        y = pulp.LpVariable.dicts("y", self.J, cat='Binary')
        x = pulp.LpVariable.dicts("x", [(i, j) for i in self.I for j in self.J], lowBound=0, upBound=1,
                                  cat='Continuous')

        # Objective: Minimize Fixed Hub Costs + (Transport + Handling) Costs
        prob += pulp.lpSum([self.f[j] * y[j] for j in self.J]) + \
                pulp.lpSum([(self.c[i, j] + self.v[j]) * self.demand[i] * x[i, j] for i in self.I for j in self.J])

        # Constraints: 100% Demand satisfaction & Flow only to open hubs
        for i in self.I:
            prob += pulp.lpSum([x[i, j] for j in self.J]) == 1.0
            for j in self.J:
                prob += x[i, j] <= y[j]

        prob.solve(pulp.PULP_CBC_CMD(msg=False))
        return self._extract_results(prob, y)

    # 2. P-Median Engine (S2, S3): Minimize distance with fixed number of hubs
    def solve_p_median(self, scenario_name, p_count):
        prob = pulp.LpProblem(scenario_name, pulp.LpMinimize)
        y = pulp.LpVariable.dicts("y", self.J, cat='Binary')
        x = pulp.LpVariable.dicts("x", [(i, j) for i in self.I for j in self.J], lowBound=0, upBound=1,
                                  cat='Continuous')

        # Objective: Minimize variable costs (Transport + Handling)
        prob += pulp.lpSum([(self.c[i, j] + self.v[j]) * self.demand[i] * x[i, j] for i in self.I for j in self.J])

        for i in self.I:
            prob += pulp.lpSum([x[i, j] for j in self.J]) == 1.0
            for j in self.J:
                prob += x[i, j] <= y[j]

        # Constraint: Exactly p_count hubs must be opened
        prob += pulp.lpSum([y[j] for j in self.J]) == p_count

        prob.solve(pulp.PULP_CBC_CMD(msg=False))
        return self._extract_results(prob, y)

    # 3. CFLP Engine (S4, S5): Capacitated with 3PL Overflow Logic (Soft Constraint)
    def solve_cflp(self, scenario_name, peak_multiplier=1.0):
        prob = pulp.LpProblem(scenario_name, pulp.LpMinimize)
        y = pulp.LpVariable.dicts("y", self.J, cat='Binary')
        x = pulp.LpVariable.dicts("x", [(i, j) for i in self.I for j in self.J], lowBound=0, upBound=1,
                                  cat='Continuous')

        # Continuous variable to capture excess demand beyond hub capacity
        overflow = pulp.LpVariable.dicts("overflow", self.J, lowBound=0, cat='Continuous')

        # Objective: Fixed + Variable + (Overflow * 3PL Penalty)
        prob += pulp.lpSum([self.f[j] * y[j] for j in self.J]) + \
                pulp.lpSum(
                    [(self.c[i, j] + self.v[j]) * (self.demand[i] * peak_multiplier) * x[i, j] for i in self.I for j in
                     self.J]) + \
                pulp.lpSum([overflow[j] * self.cost_3pl for j in self.J])

        for i in self.I:
            prob += pulp.lpSum([x[i, j] for j in self.J]) == 1.0

        # Constraint: Demand routed to hub j must be <= (Base Capacity + 3PL Overflow)
        for j in self.J:
            prob += pulp.lpSum([(self.demand[i] * peak_multiplier) * x[i, j] for i in self.I]) <= (self.cap[j] * y[j]) + \
                    overflow[j]

        prob.solve(pulp.PULP_CBC_CMD(msg=False))
        return self._extract_results(prob, y)

    # 4. Coverage Engine (S6, S7): Distance restricted with SLA Breach Penalty (Soft Constraint)
    def solve_coverage(self, scenario_name, max_radius):
        prob = pulp.LpProblem(scenario_name, pulp.LpMinimize)
        y = pulp.LpVariable.dicts("y", self.J, cat='Binary')
        x = pulp.LpVariable.dicts("x", [(i, j) for i in self.I for j in self.J], lowBound=0, upBound=1,
                                  cat='Continuous')

        # Objective formulation: Dynamically add SLA penalty if distance exceeds max_radius
        objective = pulp.lpSum([self.f[j] * y[j] for j in self.J])
        for i in self.I:
            for j in self.J:
                # Apply SLA breach penalty if the route violates the coverage radius
                penalty = self.cost_sla if self.d[i, j] > max_radius else 0
                total_unit_cost = self.c[i, j] + self.v[j] + penalty
                objective += total_unit_cost * self.demand[i] * x[i, j]

        prob += objective

        for i in self.I:
            prob += pulp.lpSum([x[i, j] for j in self.J]) == 1.0
            for j in self.J:
                prob += x[i, j] <= y[j]

        prob.solve(pulp.PULP_CBC_CMD(msg=False))
        return self._extract_results(prob, y)

    # 5. Hybrid Engine (S8): Enterprise Level Solver (Capacity + SLA + Eligibility)
    def solve_hybrid(self, scenario_name, max_radius=100, peak_multiplier=1.0):
        prob = pulp.LpProblem(scenario_name, pulp.LpMinimize)
        y = pulp.LpVariable.dicts("y", self.J, cat='Binary')
        x = pulp.LpVariable.dicts("x", [(i, j) for i in self.I for j in self.J], lowBound=0, upBound=1,
                                  cat='Continuous')

        overflow = pulp.LpVariable.dicts("overflow", self.J, lowBound=0, cat='Continuous')

        # Objective: Base Costs + SLA Penalty (Distance) + 3PL Penalty (Capacity)
        objective = pulp.lpSum([self.f[j] * y[j] for j in self.J]) + \
                    pulp.lpSum([overflow[j] * self.cost_3pl for j in self.J])

        for i in self.I:
            for j in self.J:
                penalty = self.cost_sla if self.d[i, j] > max_radius else 0
                total_unit_cost = self.c[i, j] + self.v[j] + penalty
                objective += total_unit_cost * (self.demand[i] * peak_multiplier) * x[i, j]

        prob += objective

        for i in self.I:
            prob += pulp.lpSum([x[i, j] for j in self.J]) == 1.0

        for j in self.J:
            # Soft Constraint: Capacity flex handling
            prob += pulp.lpSum([(self.demand[i] * peak_multiplier) * x[i, j] for i in self.I]) <= (self.cap[j] * y[j]) + \
                    overflow[j]

            for i in self.I:
                # Hard Constraint: Hub Eligibility (e.g., Pharmaceuticals MUST go to Secure Nodes)
                # No penalty can override this strict physical/regulatory requirement.
                if self.elig and self.elig.get((i, j), 1) == 0:
                    prob += x[i, j] == 0

        prob.solve(pulp.PULP_CBC_CMD(msg=False))
        return self._extract_results(prob, y)

    def _extract_results(self, prob, y_vars):
        status = pulp.LpStatus[prob.status]
        if status != 'Optimal':
            return {"status": status, "cost": float('inf'), "hubs": []}

        selected_hubs = [j for j in self.J if y_vars[j].varValue is not None and y_vars[j].varValue > 0.5]
        return {"status": status, "cost": pulp.value(prob.objective), "hubs": selected_hubs}
