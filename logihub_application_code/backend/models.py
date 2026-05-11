import pulp as pl
import pandas as pd

def calculate_business_metrics(assignments, total_cost_km_tons):
    """
    Calculate business metrics from assignments for the Decision Cockpit.
    Assumptions:
    - Transport cost = $0.10 per ton-km
    - Avg Speed = 50 km/h (for lead time)
    - CO2 emission = 0.062 kg per ton-km
    """
    transport_cost_usd = total_cost_km_tons * 0.10
    total_tons = sum(a.get('demand_tons', a.get('flow_tons', 0)) for a in assignments)
    avg_distance = total_cost_km_tons / total_tons if total_tons > 0 else 0
    avg_lead_time_hrs = avg_distance / 50.0
    co2_emissions_kg = total_cost_km_tons * 0.062
    
    # Coverage calculation (within 150km)
    covered_tons = sum(a.get('demand_tons', a.get('flow_tons', 0)) for a in assignments if a['distance_km'] <= 150)
    coverage_pct = (covered_tons / total_tons * 100) if total_tons > 0 else 0

    return {
        "total_cost_usd": transport_cost_usd,
        "avg_distance_km": avg_distance,
        "avg_lead_time_hrs": avg_lead_time_hrs,
        "co2_emissions_kg": co2_emissions_kg,
        "coverage_within_150km_pct": coverage_pct,
        "total_tons": total_tons
    }

def run_baseline(df_demand, df_hubs, df_dist):
    """
    Calculate baseline metrics by selecting the 3 hubs with the largest capacity
    and assigning each region to the closest of these 3 hubs.
    """
    has_capacity = 'capacity_tons' in df_hubs.columns
    has_fixed_cost = 'fixed_cost' in df_hubs.columns

    if has_capacity:
        baseline_hubs = df_hubs.nlargest(3, 'capacity_tons')['hub_id'].tolist()
    else:
        baseline_hubs = df_hubs.head(3)['hub_id'].tolist()

    regions = df_demand['region_id'].tolist()
    demand = df_demand.set_index('region_id')['demand_tons'].to_dict()
    
    region_coords = df_demand.set_index('region_id')[['lat', 'lon']].to_dict('index')
    hub_coords = df_hubs.set_index('hub_id')[['lat', 'lon']].to_dict('index')

    assignments = []
    total_cost = 0

    for idx, d_row in df_demand.iterrows():
        r_id = d_row['region_id']
        r_demand = demand[r_id]
        
        # Find closest baseline hub
        closest_hub = None
        min_dist = float('inf')
        
        for h_id in baseline_hubs:
            dist = df_dist[(df_dist['demand_id'] == r_id) & (df_dist['hub_id'] == h_id)]['distance_km'].values[0]
            if dist < min_dist:
                min_dist = dist
                closest_hub = h_id
                
        assignments.append({
            "region_id": r_id,
            "region_lat": region_coords[r_id]['lat'],
            "region_lon": region_coords[r_id]['lon'],
            "hub_id": closest_hub,
            "hub_lat": hub_coords[closest_hub]['lat'],
            "hub_lon": hub_coords[closest_hub]['lon'],
            "demand_tons": r_demand,
            "distance_km": min_dist
        })
        total_cost += min_dist * r_demand

    opened_hubs_data = []
    for h in baseline_hubs:
        hub_row = df_hubs[df_hubs['hub_id'] == h].iloc[0]
        opened_hubs_data.append({
            "id": h, 
            "lat": hub_coords[h]['lat'], 
            "lon": hub_coords[h]['lon'],
            "capacity_tons": float(hub_row['capacity_tons']) if has_capacity else 50000,
            "fixed_cost": float(hub_row['fixed_cost']) if has_fixed_cost else 100000
        })

    metrics = calculate_business_metrics(assignments, total_cost)

    return {
        "status": "Baseline",
        "opened_hubs": opened_hubs_data,
        "assignments": assignments,
        "total_cost": total_cost,
        "metrics": metrics
    }

def run_p_median(df_demand, df_hubs, df_dist, P):
    has_capacity = 'capacity_tons' in df_hubs.columns
    has_fixed_cost = 'fixed_cost' in df_hubs.columns

    regions = df_demand['region_id'].tolist()
    hubs = df_hubs['hub_id'].tolist()
    demand = df_demand.set_index('region_id')['demand_tons'].to_dict()
    
    region_coords = df_demand.set_index('region_id')[['lat', 'lon']].to_dict('index')
    hub_coords = df_hubs.set_index('hub_id')[['lat', 'lon']].to_dict('index')
    
    dist_dict = {}
    for _, row in df_dist.iterrows():
        dist_dict[(row['demand_id'], row['hub_id'])] = row['distance_km']
        
    model = pl.LpProblem("P-Median", pl.LpMinimize)
    
    y = pl.LpVariable.dicts("OpenHub", hubs, cat='Binary')
    x = pl.LpVariable.dicts("Assign", [(i, j) for i in regions for j in hubs], cat='Binary')
    
    model += pl.lpSum(demand[i] * dist_dict.get((i, j), 999999) * x[(i, j)] for i in regions for j in hubs)
    model += pl.lpSum(y[j] for j in hubs) == P
    
    for i in regions:
        model += pl.lpSum(x[(i, j)] for j in hubs) == 1
        
    for i in regions:
        for j in hubs:
            model += x[(i, j)] <= y[j]
            
    model.solve(pl.PULP_CBC_CMD(msg=0, timeLimit=10, gapRel=0.05))
    
    if pl.LpStatus[model.status] != 'Optimal':
        return {"status": pl.LpStatus[model.status], "error": "Could not find optimal solution"}
        
    opened_hubs_data = []
    for j in hubs:
        if y[j].varValue and y[j].varValue > 0.5:
            hub_row = df_hubs[df_hubs['hub_id'] == j].iloc[0]
            opened_hubs_data.append({
                "id": j,
                "lat": hub_coords[j]['lat'],
                "lon": hub_coords[j]['lon'],
                "capacity_tons": float(hub_row['capacity_tons']) if has_capacity else 50000,
                "fixed_cost": float(hub_row['fixed_cost']) if has_fixed_cost else 100000
            })
            
    assignments = []
    for i in regions:
        for j in hubs:
            if x[(i, j)].varValue and x[(i, j)].varValue > 0.5:
                assignments.append({
                    "region_id": i,
                    "region_lat": region_coords[i]['lat'],
                    "region_lon": region_coords[i]['lon'],
                    "hub_id": j,
                    "hub_lat": hub_coords[j]['lat'],
                    "hub_lon": hub_coords[j]['lon'],
                    "demand_tons": demand[i],
                    "distance_km": dist_dict.get((i, j), 0)
                })
                
    total_cost = pl.value(model.objective)
    metrics = calculate_business_metrics(assignments, total_cost)
                
    return {
        "status": "Optimal",
        "opened_hubs": opened_hubs_data,
        "assignments": assignments,
        "total_cost": total_cost,
        "metrics": metrics
    }

def run_cflp(df_demand, df_hubs, df_dist):
    has_capacity = 'capacity_tons' in df_hubs.columns
    has_fixed_cost = 'fixed_cost' in df_hubs.columns

    if not has_capacity or not has_fixed_cost:
        # Fallback to P-median if missing required CFLP data
        return run_p_median(df_demand, df_hubs, df_dist, 5)

    regions = df_demand['region_id'].tolist()
    hubs = df_hubs['hub_id'].tolist()
    demand = df_demand.set_index('region_id')['demand_tons'].to_dict()
    fixed_cost = df_hubs.set_index('hub_id')['fixed_cost'].to_dict()
    capacity = df_hubs.set_index('hub_id')['capacity_tons'].to_dict()
    
    region_coords = df_demand.set_index('region_id')[['lat', 'lon']].to_dict('index')
    hub_coords = df_hubs.set_index('hub_id')[['lat', 'lon']].to_dict('index')
    
    dist_dict = {}
    for _, row in df_dist.iterrows():
        dist_dict[(row['demand_id'], row['hub_id'])] = row['distance_km']
        
    model = pl.LpProblem("CFLP", pl.LpMinimize)
    
    y = pl.LpVariable.dicts("OpenHub", hubs, cat='Binary')
    x = pl.LpVariable.dicts("Flow", [(i, j) for i in regions for j in hubs], lowBound=0, cat='Continuous')
    
    transport_rate = 0.1
    
    model += pl.lpSum(fixed_cost[j] * y[j] for j in hubs) + \
             pl.lpSum(transport_rate * dist_dict.get((i, j), 999999) * x[(i, j)] for i in regions for j in hubs)
             
    for i in regions:
        model += pl.lpSum(x[(i, j)] for j in hubs) == demand[i]
        
    for j in hubs:
        model += pl.lpSum(x[(i, j)] for i in regions) <= capacity[j] * y[j]
        
    model.solve(pl.PULP_CBC_CMD(msg=0, timeLimit=10, gapRel=0.05))
    
    if pl.LpStatus[model.status] != 'Optimal':
        return {"status": pl.LpStatus[model.status], "error": "Could not find optimal solution"}
        
    opened_hubs_data = []
    for j in hubs:
        if y[j].varValue and y[j].varValue > 0.5:
            opened_hubs_data.append({
                "id": j,
                "lat": hub_coords[j]['lat'],
                "lon": hub_coords[j]['lon'],
                "capacity_tons": capacity[j],
                "fixed_cost": fixed_cost[j]
            })
            
    assignments = []
    transport_cost_km_tons = 0
    for i in regions:
        for j in hubs:
            if x[(i, j)].varValue and x[(i, j)].varValue > 0.01:
                flow = x[(i, j)].varValue
                dist = dist_dict.get((i, j), 0)
                transport_cost_km_tons += flow * dist
                assignments.append({
                    "region_id": i,
                    "region_lat": region_coords[i]['lat'],
                    "region_lon": region_coords[i]['lon'],
                    "hub_id": j,
                    "hub_lat": hub_coords[j]['lat'],
                    "hub_lon": hub_coords[j]['lon'],
                    "flow_tons": flow,
                    "distance_km": dist
                })
                
    total_cost = pl.value(model.objective)
    metrics = calculate_business_metrics(assignments, transport_cost_km_tons)
    metrics["total_cost_usd"] = total_cost # Includes fixed costs
                
    return {
        "status": "Optimal",
        "opened_hubs": opened_hubs_data,
        "assignments": assignments,
        "total_cost": transport_cost_km_tons, # Standardize to km-tons for map
        "metrics": metrics
    }

def run_uflp(df_demand, df_hubs, df_dist):
    has_capacity = 'capacity_tons' in df_hubs.columns
    has_fixed_cost = 'fixed_cost' in df_hubs.columns

    if not has_fixed_cost:
        return run_p_median(df_demand, df_hubs, df_dist, 5)

    regions = df_demand['region_id'].tolist()
    hubs = df_hubs['hub_id'].tolist()
    demand = df_demand.set_index('region_id')['demand_tons'].to_dict()
    fixed_cost = df_hubs.set_index('hub_id')['fixed_cost'].to_dict()
    
    region_coords = df_demand.set_index('region_id')[['lat', 'lon']].to_dict('index')
    hub_coords = df_hubs.set_index('hub_id')[['lat', 'lon']].to_dict('index')
    
    dist_dict = {}
    for _, row in df_dist.iterrows():
        dist_dict[(row['demand_id'], row['hub_id'])] = row['distance_km']
        
    model = pl.LpProblem("UFLP", pl.LpMinimize)
    
    y = pl.LpVariable.dicts("OpenHub", hubs, cat='Binary')
    x = pl.LpVariable.dicts("Assign", [(i, j) for i in regions for j in hubs], cat='Binary')
    
    transport_rate = 0.1
    
    model += pl.lpSum(fixed_cost[j] * y[j] for j in hubs) + \
             pl.lpSum(transport_rate * dist_dict.get((i, j), 999999) * demand[i] * x[(i, j)] for i in regions for j in hubs)
             
    for i in regions:
        model += pl.lpSum(x[(i, j)] for j in hubs) == 1
        
    for i in regions:
        for j in hubs:
            model += x[(i, j)] <= y[j]
            
    model.solve(pl.PULP_CBC_CMD(msg=0, timeLimit=10, gapRel=0.05))
    
    if pl.LpStatus[model.status] != 'Optimal':
        return {"status": pl.LpStatus[model.status], "error": "Could not find optimal solution"}
        
    opened_hubs_data = []
    for j in hubs:
        if y[j].varValue and y[j].varValue > 0.5:
            hub_row = df_hubs[df_hubs['hub_id'] == j].iloc[0]
            opened_hubs_data.append({
                "id": j,
                "lat": hub_coords[j]['lat'],
                "lon": hub_coords[j]['lon'],
                "capacity_tons": float(hub_row['capacity_tons']) if has_capacity else 50000,
                "fixed_cost": fixed_cost[j]
            })
            
    assignments = []
    transport_cost_km_tons = 0
    for i in regions:
        for j in hubs:
            if x[(i, j)].varValue and x[(i, j)].varValue > 0.5:
                dist = dist_dict.get((i, j), 0)
                transport_cost_km_tons += demand[i] * dist
                assignments.append({
                    "region_id": i,
                    "region_lat": region_coords[i]['lat'],
                    "region_lon": region_coords[i]['lon'],
                    "hub_id": j,
                    "hub_lat": hub_coords[j]['lat'],
                    "hub_lon": hub_coords[j]['lon'],
                    "demand_tons": demand[i],
                    "distance_km": dist
                })
                
    total_cost = pl.value(model.objective)
    metrics = calculate_business_metrics(assignments, transport_cost_km_tons)
    metrics["total_cost_usd"] = total_cost 
                
    return {
        "status": "Optimal",
        "opened_hubs": opened_hubs_data,
        "assignments": assignments,
        "total_cost": transport_cost_km_tons,
        "metrics": metrics
    }

def run_mclp(df_demand, df_hubs, df_dist, P, radius_km):
    has_capacity = 'capacity_tons' in df_hubs.columns
    has_fixed_cost = 'fixed_cost' in df_hubs.columns

    regions = df_demand['region_id'].tolist()
    hubs = df_hubs['hub_id'].tolist()
    demand = df_demand.set_index('region_id')['demand_tons'].to_dict()
    
    region_coords = df_demand.set_index('region_id')[['lat', 'lon']].to_dict('index')
    hub_coords = df_hubs.set_index('hub_id')[['lat', 'lon']].to_dict('index')
    
    dist_dict = {}
    for _, row in df_dist.iterrows():
        dist_dict[(row['demand_id'], row['hub_id'])] = row['distance_km']
        
    model = pl.LpProblem("MCLP", pl.LpMaximize)
    
    y = pl.LpVariable.dicts("OpenHub", hubs, cat='Binary')
    z = pl.LpVariable.dicts("Covered", regions, cat='Binary')
    
    model += pl.lpSum(demand[i] * z[i] for i in regions)
    
    model += pl.lpSum(y[j] for j in hubs) == P
    
    for i in regions:
        # Hubs within radius
        Ni = [j for j in hubs if dist_dict.get((i, j), 999999) <= radius_km]
        if Ni:
            model += z[i] <= pl.lpSum(y[j] for j in Ni)
        else:
            model += z[i] == 0
            
    model.solve(pl.PULP_CBC_CMD(msg=0, timeLimit=10, gapRel=0.05))
    
    if pl.LpStatus[model.status] != 'Optimal':
        return {"status": pl.LpStatus[model.status], "error": "Could not find optimal solution"}
        
    # Extract results
    opened_hubs = [j for j in hubs if y[j].varValue and y[j].varValue > 0.5]
    
    opened_hubs_data = []
    for j in opened_hubs:
        hub_row = df_hubs[df_hubs['hub_id'] == j].iloc[0]
        opened_hubs_data.append({
            "id": j,
            "lat": hub_coords[j]['lat'],
            "lon": hub_coords[j]['lon'],
            "capacity_tons": float(hub_row['capacity_tons']) if has_capacity else 50000,
            "fixed_cost": float(hub_row['fixed_cost']) if has_fixed_cost else 100000
        })
        
    # For reporting/map, assign to closest OPEN hub even if outside radius
    assignments = []
    transport_cost_km_tons = 0
    total_cost_usd = 0
    
    for i in regions:
        closest_hub = min(opened_hubs, key=lambda j: dist_dict.get((i, j), 999999))
        dist = dist_dict.get((i, closest_hub), 0)
        transport_cost_km_tons += demand[i] * dist
        
        assignments.append({
            "region_id": i,
            "region_lat": region_coords[i]['lat'],
            "region_lon": region_coords[i]['lon'],
            "hub_id": closest_hub,
            "hub_lat": hub_coords[closest_hub]['lat'],
            "hub_lon": hub_coords[closest_hub]['lon'],
            "demand_tons": demand[i],
            "distance_km": dist
        })
        
    metrics = calculate_business_metrics(assignments, transport_cost_km_tons)
    # Total cost for MCLP incorporates fixed cost if available
    fixed_cost_dict = df_hubs.set_index('hub_id')['fixed_cost'].to_dict() if has_fixed_cost else {}
    for j in opened_hubs:
        total_cost_usd += fixed_cost_dict.get(j, 100000)
    total_cost_usd += transport_cost_km_tons * 0.10
    metrics["total_cost_usd"] = total_cost_usd
                
    return {
        "status": "Optimal",
        "opened_hubs": opened_hubs_data,
        "assignments": assignments,
        "total_cost": transport_cost_km_tons,
        "metrics": metrics
    }
