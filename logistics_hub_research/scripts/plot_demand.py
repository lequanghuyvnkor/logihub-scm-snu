import pandas as pd
import matplotlib.pyplot as plt
import os
import matplotlib.font_manager as fm

# Set font for Korean
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

base_dir = r"C:\Users\PC\.gemini\antigravity\scratch\korea_logistics_hub_project"

def plot_demand():
    demand_17 = pd.read_csv(os.path.join(base_dir, "data_processed", "demand_17_regions_2023.csv"))
    
    # Sort by total volume
    demand_17 = demand_17.sort_values(by='total_volume', ascending=True)
    
    # 1. Total Volume by Region
    plt.figure(figsize=(10, 8))
    plt.barh(demand_17['region_name'], demand_17['total_volume'] / 1e6, color='skyblue')
    plt.title('Total Freight Volume by Region (2023)')
    plt.xlabel('Volume (Million Tons)')
    plt.ylabel('Region')
    plt.tight_layout()
    plt.savefig(os.path.join(base_dir, "outputs", "figures", "total_volume_by_region.png"))
    plt.close()
    
    # 2. Inbound vs Outbound
    fig, ax = plt.subplots(figsize=(12, 8))
    y = range(len(demand_17))
    width = 0.4
    
    ax.barh([p - width/2 for p in y], demand_17['outbound_volume'] / 1e6, width, label='Outbound', color='coral')
    ax.barh([p + width/2 for p in y], demand_17['inbound_volume'] / 1e6, width, label='Inbound', color='lightgreen')
    
    ax.set_yticks(y)
    ax.set_yticklabels(demand_17['region_name'])
    ax.set_title('Inbound vs Outbound Freight Volume by Region (2023)')
    ax.set_xlabel('Volume (Million Tons)')
    ax.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(base_dir, "outputs", "figures", "inbound_vs_outbound_region.png"))
    plt.close()
    
    print("Demand plots saved.")

def plot_corridors():
    corridors = pd.read_csv(os.path.join(base_dir, "data_processed", "top_corridors_17_2023.csv"))
    corridors['corridor'] = corridors['O_17_name'] + " -> " + corridors['D_17_name']
    
    corridors = corridors.sort_values(by='volume_ton', ascending=True)
    
    plt.figure(figsize=(12, 8))
    plt.barh(corridors['corridor'], corridors['volume_ton'] / 1e6, color='gold')
    plt.title('Top 20 Inter-Regional Freight Corridors (2023)')
    plt.xlabel('Volume (Million Tons)')
    plt.ylabel('Corridor (Origin -> Destination)')
    plt.tight_layout()
    plt.savefig(os.path.join(base_dir, "outputs", "figures", "top_corridors.png"))
    plt.close()
    
    print("Corridor plots saved.")

if __name__ == "__main__":
    plot_demand()
    plot_corridors()
