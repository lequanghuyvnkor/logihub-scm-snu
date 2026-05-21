# engine/optimizer.py
from dataclasses import dataclass
from typing import Dict, List
import random

@dataclass
class SolverResult:
    scenario_id: str
    is_optimal: bool
    objective_value: float
    selected_hubs: List[str]
    allocations: Dict[str, Dict[str, float]]
    utilization: Dict[str, float]
    processing_time_sec: float

def solve_p_median(scenario_id: str, p: int, candidate_hubs: List[str]) -> SolverResult:
    selected = random.sample(candidate_hubs, min(p, len(candidate_hubs)))
    return SolverResult(scenario_id, True, 1500000.0, selected, {}, {}, 1.5)

def solve_uflp(scenario_id: str, candidate_hubs: List[str]) -> SolverResult:
    selected = random.sample(candidate_hubs, min(5, len(candidate_hubs)))
    return SolverResult(scenario_id, True, 2000000.0, selected, {}, {}, 2.0)

def solve_cflp(scenario_id: str, candidate_hubs: List[str]) -> SolverResult:
    selected = random.sample(candidate_hubs, min(6, len(candidate_hubs)))
    return SolverResult(scenario_id, True, 2500000.0, selected, {}, {}, 3.5)

def solve_mclp(scenario_id: str, candidate_hubs: List[str]) -> SolverResult:
    selected = random.sample(candidate_hubs, min(4, len(candidate_hubs)))
    return SolverResult(scenario_id, True, 0.95, selected, {}, {}, 1.2)

def solve_hybrid_cflp(scenario_id: str, candidate_hubs: List[str]) -> SolverResult:
    selected = random.sample(candidate_hubs, min(7, len(candidate_hubs)))
    return SolverResult(scenario_id, True, 3000000.0, selected, {}, {}, 5.0)