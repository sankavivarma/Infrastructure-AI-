COLUMN_MAPPINGS = {
    "sr.no.": "sr_no",
    "sr. no.": "sr_no",
    "sr.no": "sr_no",
    "sector": "sector",
    "line ministry": "ministry",
    "ministry": "ministry",
    "projectid": "project_id",
    "project id": "project_id",
    "project_id": "project_id",
    "project name": "project_name",
    "project_name": "project_name",
    "original cost": "planned_cost",
    "latest revised cost": "current_cost",
    "expenditure": "expenditure"
}

def clean_numeric(val):
    if val is None or val == "":
        return 0.0
    val_str = str(val).replace(',', '').replace('\n', ' ').strip()
    try:
        return float(val_str)
    except ValueError:
        return 0.0

def normalize_column_name(col: str) -> str:
    cleaned = col.replace('\n', ' ').strip().lower()
    if "original cost" in cleaned:
        return "planned_cost"
    if "latest revised cost" in cleaned:
        return "current_cost"
    if "expenditure" in cleaned:
        return "expenditure"
    if "line ministry" in cleaned:
        return "ministry"
    if "sector" in cleaned:
        return "sector"
    if "projectid" in cleaned or "project id" in cleaned:
        return "project_id"
    if "project name" in cleaned:
        return "project_name"
    if "sr.no" in cleaned:
        return "sr_no"
    return cleaned

def clean_and_transform_rows(header: list, data_rows: list) -> list:
    norm_headers = [normalize_column_name(h) for h in header]
    
    transformed = []
    for idx, row in enumerate(data_rows):
        row_dict = dict(zip(norm_headers, row))
        
        sr_no_val = row_dict.get('sr_no', str(idx + 1))
        p_id = str(row_dict.get('project_id', '')).strip()
        if not p_id or p_id.lower() == 'nan':
            p_id = f"PRJ-{100000 + idx}"

        p_name = str(row_dict.get('project_name', 'Unnamed Project')).strip()
        sector = str(row_dict.get('sector', 'General Infrastructure')).strip()
        ministry = str(row_dict.get('ministry', 'Ministry of Infrastructure')).strip()

        planned_cost = clean_numeric(row_dict.get('planned_cost', 0.0))
        current_cost = clean_numeric(row_dict.get('current_cost', 0.0))
        expenditure = clean_numeric(row_dict.get('expenditure', 0.0))

        cost_variance = current_cost - planned_cost
        
        exp_ratio = (expenditure / current_cost * 100.0) if current_cost > 0 else 0.0
        actual_progress = min(100.0, max(0.0, round(exp_ratio, 2)))
        
        status = "Active"
        if current_cost > planned_cost:
            status = "Critical"
        if actual_progress >= 100.0:
            status = "Completed"

        transformed.append({
            "sr_no": int(sr_no_val) if str(sr_no_val).isdigit() else idx + 1,
            "project_id": p_id,
            "project_name": p_name,
            "sector": sector,
            "ministry": ministry,
            "planned_cost": planned_cost,
            "current_cost": current_cost,
            "expenditure": expenditure,
            "cost_variance": round(cost_variance, 2),
            "actual_progress": actual_progress,
            "status": status
        })

    return transformed
