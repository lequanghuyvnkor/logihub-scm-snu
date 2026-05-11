import math
import pandas as pd

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees)
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371 # Radius of earth in kilometers
    return c * r

def compute_distance_matrix(df_demand, df_hubs):
    """
    Compute distance matrix between demand regions and candidate hubs.
    Expected columns in df_demand: 'region_id', 'lat', 'lon'
    Expected columns in df_hubs: 'hub_id', 'lat', 'lon'
    """
    distances = []
    
    for _, d_row in df_demand.iterrows():
        for _, h_row in df_hubs.iterrows():
            dist = haversine_distance(
                d_row['lat'], d_row['lon'], 
                h_row['lat'], h_row['lon']
            )
            distances.append({
                'demand_id': d_row['region_id'],
                'hub_id': h_row['hub_id'],
                'distance_km': dist
            })
            
    return pd.DataFrame(distances)
