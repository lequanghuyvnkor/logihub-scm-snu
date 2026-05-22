import pulp

class SupplyChainOptimizer:
    def __init__(self, demand_nodes, candidate_hubs, distances, demands, fixed_costs, handling_costs, capacities=None, eligibilities=None, transport_rate=500):
        self.I = demand_nodes
        self.J = candidate_hubs
        self.d = distances         # dict: (i, j) -> distance
        self.demand = demands      # dict: i -> tons
        self.f = fixed_costs       # dict: j -> cost
        self.v = handling_costs    # dict: j -> unit handling cost
        self.cap = capacities      # dict: j -> tons
        self.elig = eligibilities  # dict: (i, j) -> 1 or 0
        
        # 외부 Config에서 주입받은 transport_rate 적용
        self.c = {(i, j): self.d[i, j] * transport_rate for i in self.I for j in self.J}

    # 1. UFLP 엔진 (S1)
    def solve_uflp(self, scenario_name):
        prob = pulp.LpProblem(scenario_name, pulp.LpMinimize)
        y = pulp.LpVariable.dicts("y", self.J, cat='Binary')
        x = pulp.LpVariable.dicts("x", [(i, j) for i in self.I for j in self.J], lowBound=0, upBound=1, cat='Continuous')
        
        prob += pulp.lpSum([self.f[j] * y[j] for j in self.J]) + \
                pulp.lpSum([(self.c[i, j] + self.v[j]) * self.demand[i] * x[i, j] for i in self.I for j in self.J])
                
        for i in self.I:
            prob += pulp.lpSum([x[i, j] for j in self.J]) == 1.0
            for j in self.J:
                prob += x[i, j] <= y[j]
                
        prob.solve(pulp.PULP_CBC_CMD(msg=False))
        return self._extract_results(prob, y)

    # 2. P-Median 엔진 (S2, S3)
    def solve_p_median(self, scenario_name, p_count):
        prob = pulp.LpProblem(scenario_name, pulp.LpMinimize)
        y = pulp.LpVariable.dicts("y", self.J, cat='Binary')
        x = pulp.LpVariable.dicts("x", [(i, j) for i in self.I for j in self.J], lowBound=0, upBound=1, cat='Continuous')
        
        prob += pulp.lpSum([(self.c[i, j] + self.v[j]) * self.demand[i] * x[i, j] for i in self.I for j in self.J])
        
        for i in self.I:
            prob += pulp.lpSum([x[i, j] for j in self.J]) == 1.0
            for j in self.J:
                prob += x[i, j] <= y[j]
                
        prob += pulp.lpSum([y[j] for j in self.J]) == p_count
        
        prob.solve(pulp.PULP_CBC_CMD(msg=False))
        return self._extract_results(prob, y)

    # 3. CFLP 엔진 (S4, S5)
    def solve_cflp(self, scenario_name, peak_multiplier=1.0):
        prob = pulp.LpProblem(scenario_name, pulp.LpMinimize)
        y = pulp.LpVariable.dicts("y", self.J, cat='Binary')
        x = pulp.LpVariable.dicts("x", [(i, j) for i in self.I for j in self.J], lowBound=0, upBound=1, cat='Continuous')
        
        prob += pulp.lpSum([self.f[j] * y[j] for j in self.J]) + \
                pulp.lpSum([(self.c[i, j] + self.v[j]) * (self.demand[i] * peak_multiplier) * x[i, j] for i in self.I for j in self.J])
                
        for i in self.I:
            prob += pulp.lpSum([x[i, j] for j in self.J]) == 1.0
            
        for j in self.J:
            prob += pulp.lpSum([(self.demand[i] * peak_multiplier) * x[i, j] for i in self.I]) <= self.cap[j] * y[j]
            
        prob.solve(pulp.PULP_CBC_CMD(msg=False))
        return self._extract_results(prob, y)

    # 4. Coverage 엔진 (S6, S7)
    def solve_coverage(self, scenario_name, max_radius):
        prob = pulp.LpProblem(scenario_name, pulp.LpMinimize)
        y = pulp.LpVariable.dicts("y", self.J, cat='Binary')
        x = pulp.LpVariable.dicts("x", [(i, j) for i in self.I for j in self.J], lowBound=0, upBound=1, cat='Continuous')
        
        prob += pulp.lpSum([self.f[j] * y[j] for j in self.J]) + \
                pulp.lpSum([(self.c[i, j] + self.v[j]) * self.demand[i] * x[i, j] for i in self.I for j in self.J])
                
        for i in self.I:
            prob += pulp.lpSum([x[i, j] for j in self.J]) == 1.0
            for j in self.J:
                prob += x[i, j] <= y[j]
                if self.d[i, j] > max_radius:
                    prob += x[i, j] == 0
                    
        prob.solve(pulp.PULP_CBC_CMD(msg=False))
        return self._extract_results(prob, y)

    # 5. Hybrid 엔진 (S8)
    def solve_hybrid(self, scenario_name):
        prob = pulp.LpProblem(scenario_name, pulp.LpMinimize)
        y = pulp.LpVariable.dicts("y", self.J, cat='Binary')
        x = pulp.LpVariable.dicts("x", [(i, j) for i in self.I for j in self.J], lowBound=0, upBound=1, cat='Continuous')
        
        prob += pulp.lpSum([self.f[j] * y[j] for j in self.J]) + \
                pulp.lpSum([(self.c[i, j] + self.v[j]) * self.demand[i] * x[i, j] for i in self.I for j in self.J])
                
        for i in self.I:
            prob += pulp.lpSum([x[i, j] for j in self.J]) == 1.0
            
        for j in self.J:
            prob += pulp.lpSum([self.demand[i] * x[i, j] for i in self.I]) <= self.cap[j] * y[j]
            for i in self.I:
                if self.elig[i, j] == 0:
                    prob += x[i, j] == 0
                    
        prob.solve(pulp.PULP_CBC_CMD(msg=False))
        return self._extract_results(prob, y)

    def _extract_results(self, prob, y_vars):
        status = pulp.LpStatus[prob.status]
        if status != 'Optimal':
            return {"status": status, "cost": float('inf'), "hubs": []}
            
        selected_hubs = [j for j in self.J if y_vars[j].varValue is not None and y_vars[j].varValue > 0.5]
        return {"status": status, "cost": pulp.value(prob.objective), "hubs": selected_hubs}
