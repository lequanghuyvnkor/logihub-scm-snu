"""Seasonality and product-family configuration for LogiHub Group A."""

PRODUCT_FAMILIES = [
    "Fresh_Food",
    "FMCG_Packaged",
    "Industrial_Materials",
    "Durables_Electronics",
    "Ecommerce_Misc",
]

# Heuristic monthly seasonality. Each vector is normalized in pipeline.py so the 12-month mean equals 1.0.
SEASONAL_INDEX_RAW = {
    "overall_index": [1.04, 0.94, 0.96, 0.99, 1.02, 0.98, 1.01, 1.03, 1.08, 1.00, 0.97, 0.98],
    "Fresh_Food": [1.12, 0.98, 0.95, 0.96, 1.02, 0.98, 1.00, 1.03, 1.15, 0.99, 0.91, 0.91],
    "FMCG_Packaged": [1.06, 0.95, 0.96, 0.99, 1.01, 0.98, 1.00, 1.02, 1.10, 1.00, 0.96, 0.97],
    "Industrial_Materials": [0.92, 0.88, 1.03, 1.05, 1.06, 1.02, 0.99, 0.98, 1.01, 1.04, 1.03, 0.99],
    "Durables_Electronics": [0.98, 0.92, 0.96, 1.00, 1.03, 1.01, 0.99, 1.02, 1.05, 1.01, 1.00, 1.03],
    "Ecommerce_Misc": [1.02, 0.93, 0.95, 0.98, 1.00, 0.99, 1.01, 1.02, 1.04, 0.99, 1.03, 1.04],
}

# Temporary deterministic fallback until Group C's product classifier is integrated.
COMMODITY_TO_PRODUCT_FAMILY = {
    "품목01": "Fresh_Food", "품목02": "Fresh_Food", "품목03": "Fresh_Food", "품목04": "Fresh_Food",
    "품목05": "FMCG_Packaged", "품목06": "FMCG_Packaged", "품목07": "FMCG_Packaged", "품목08": "FMCG_Packaged",
    "품목09": "Industrial_Materials", "품목10": "Industrial_Materials", "품목11": "Industrial_Materials", "품목12": "Industrial_Materials",
    "품목13": "Industrial_Materials", "품목14": "Industrial_Materials", "품목15": "Industrial_Materials", "품목16": "Industrial_Materials",
    "품목17": "Durables_Electronics", "품목18": "Durables_Electronics", "품목19": "Durables_Electronics", "품목20": "Durables_Electronics",
    "품목21": "Durables_Electronics", "품목22": "Ecommerce_Misc", "품목23": "Ecommerce_Misc", "품목24": "Ecommerce_Misc",
    "품목25": "Ecommerce_Misc", "품목26": "Ecommerce_Misc", "품목27": "Ecommerce_Misc", "품목28": "Ecommerce_Misc",
    "품목29": "Ecommerce_Misc", "품목30": "Ecommerce_Misc", "품목31": "Ecommerce_Misc", "품목32": "Ecommerce_Misc", "품목33": "Ecommerce_Misc",
}
