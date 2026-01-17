import pandas as pd
import re

# 1. Load Data
try:
    # We use the large dataset to calculate ranks against all students
    df = pd.read_csv('large_exam_analysis_report_fixed_v3.csv')
except FileNotFoundError:
    print("CSV not found. Please ensure 'large_exam_analysis_report_fixed_v2.csv' is in the folder.")
    exit()

# ---------------------------------------------------------
# 1.5 FIX: FORCE TIME COLUMN TO BE NUMBERS
# ---------------------------------------------------------
df['Time Spent (s)'] = pd.to_numeric(df['Time Spent (s)'], errors='coerce').fillna(0)

# 2. Extract Tags
def extract_tag(q_text):
    match = re.search(r'\[(IB|CB|OL)\]', str(q_text))
    tags = {'IB': 'Image Based', 'CB': 'Clinical Based', 'OL': 'One Liner'}
    return tags.get(match.group(1), 'Other') if match else 'Other'

df['Tag'] = df['Question'].apply(extract_tag)

# 3. Calculate AIR (Against all students)
student_scores = df.groupby('Student ID')['Marks'].sum().reset_index()
student_scores['Rank'] = student_scores['Marks'].rank(ascending=False, method='min')
rank_map = dict(zip(student_scores['Student ID'], student_scores['Rank']))

# Helper: Format Seconds to String (Optional, for readability in CSV)
def format_time(seconds):
    seconds = int(seconds)
    m, s = divmod(seconds, 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h}h {m}m {s}s"
    return f"{m}m {s}s"

# Filter to only generate reports for REAL students (Not Dummies)
real_student_ids = [sid for sid in df['Student ID'].unique() if not str(sid).startswith("DUMMY_")]

# List to store all student dictionaries
all_students_data = []

print(f"Processing {len(real_student_ids)} students...")

for student_id in real_student_ids:
    student_data = df[df['Student ID'] == student_id]
    
    # Initialize the dictionary for this student
    student_record = {
        'Student ID': student_id,
        'Rank': int(rank_map.get(student_id, 0))
    }
    
    # --- 1. Basic Metrics ---
    unattempted_data = student_data[student_data['Status'] == 'Unattempted']
    attempted_data = student_data[student_data['Status'] != 'Unattempted']
    correct_data = student_data[student_data['Status'] == 'Correct']
    
    student_record['Total Score'] = student_data['Marks'].sum()
    student_record['Total Qs'] = len(student_data)
    student_record['Attempted'] = len(attempted_data)
    student_record['Unattempted'] = len(unattempted_data)
    student_record['Correct'] = len(correct_data)
    student_record['Incorrect'] = len(attempted_data) - len(correct_data)
    
    # Accuracy
    acc = round((len(correct_data) / len(attempted_data) * 100), 1) if len(attempted_data) > 0 else 0
    student_record['Overall Accuracy %'] = acc
    
    # Time
    total_time_sec = student_data['Time Spent (s)'].sum()
    student_record['Total Time (s)'] = total_time_sec
    student_record['Total Time (Formatted)'] = format_time(total_time_sec)

    # --- 2. Tag Stats (Flattened) ---
    # Groups by Tag (Image Based, Clinical, etc.) and adds columns like 'Tag_Image Based_Accuracy'
    tag_stats = student_data.groupby('Tag').apply(
        lambda x: pd.Series({
            'Correct': len(x[x['Status'] == 'Correct']),
            'Total': len(x),
            'AvgTime': round(x['Time Spent (s)'].mean(), 1),
            'Accuracy': round((len(x[x['Status'] == 'Correct']) / len(x) * 100), 1) if len(x) > 0 else 0
        })
    ).reset_index()

    for _, row in tag_stats.iterrows():
        tag_prefix = f"Tag_{row['Tag']}"
        student_record[f"{tag_prefix}_Total"] = int(row['Total'])
        student_record[f"{tag_prefix}_Correct"] = int(row['Correct'])
        student_record[f"{tag_prefix}_Accuracy"] = row['Accuracy']
        student_record[f"{tag_prefix}_AvgTime"] = row['AvgTime']

    # --- 3. Difficulty Stats (Flattened) ---
    diff_stats = student_data.groupby('Difficulty').apply(
        lambda x: pd.Series({
            'Correct': len(x[x['Status'] == 'Correct']),
            'Total': len(x),
            'Accuracy': round((len(x[x['Status'] == 'Correct']) / len(x) * 100), 1) if len(x) > 0 else 0
        })
    ).reset_index()

    for _, row in diff_stats.iterrows():
        # Clean difficulty string (remove spaces)
        diff_name = row['Difficulty'].strip().replace(" ", "_")
        diff_prefix = f"Diff_{diff_name}"
        
        student_record[f"{diff_prefix}_Total"] = int(row['Total'])
        student_record[f"{diff_prefix}_Correct"] = int(row['Correct'])
        student_record[f"{diff_prefix}_Accuracy"] = row['Accuracy']

    # --- 4. Subject Stats (Flattened) ---
    # Creates columns like 'Sub_Anatomy_Score', 'Sub_Anatomy_Accuracy'
    subject_stats = student_data.groupby('Subject').apply(
        lambda x: pd.Series({
            'Total': len(x),
            'Correct': len(x[x['Status'] == 'Correct']),
            'Score': x['Marks'].sum(),
            'Accuracy': round((len(x[x['Status'] == 'Correct']) / len(x) * 100), 1) if len(x) > 0 else 0
        })
    ).reset_index()

    for _, row in subject_stats.iterrows():
        # Clean subject name for CSV column headers
        sub_name = row['Subject'].strip().replace(" ", "_").replace("/", "_")
        sub_prefix = f"Sub_{sub_name}"
        
        student_record[f"{sub_prefix}_Total"] = int(row['Total'])
        student_record[f"{sub_prefix}_Score"] = int(row['Score'])
        student_record[f"{sub_prefix}_Accuracy"] = row['Accuracy']

    # Add this student's complete record to the list
    all_students_data.append(student_record)

# Convert list of dicts to DataFrame
output_df = pd.DataFrame(all_students_data)

# Fill NaNs with 0 (For example, if a student didn't attempt a specific subject, stats will be NaN)
output_df = output_df.fillna(0)

# Reorder columns to ensure Basic Metrics are first
# We get the list of columns, separate the fixed ones, and append the dynamic ones sorted
fixed_cols = ['Student ID', 'Rank', 'Total Score', 'Overall Accuracy %', 
              'Total Qs', 'Attempted', 'Correct', 'Incorrect', 'Unattempted', 
              'Total Time (s)', 'Total Time (Formatted)']

dynamic_cols = [c for c in output_df.columns if c not in fixed_cols]
dynamic_cols.sort() # Sort alphabetically to group Subjects/Tags together

final_cols = fixed_cols + dynamic_cols

# Ensure all fixed columns exist (just in case data is empty)
existing_fixed_cols = [c for c in fixed_cols if c in output_df.columns]
output_df = output_df[existing_fixed_cols + dynamic_cols]

# Export
output_filename = 'Student_Wise_Report_All_Data.csv'
output_df.to_csv(output_filename, index=False)

print(f"Successfully generated '{output_filename}' with {len(output_df)} student records.")