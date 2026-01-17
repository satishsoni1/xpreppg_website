import json
import csv
import re

# File Paths
INPUT_FILE = 'xpreppg.registrations.json'
OUTPUT_FILE = 'student_credentials.csv'

def generate_password(name, mobile):
    if not name or not mobile:
        return "INVALID"
    
    # Logic: First 4 letters of Name (Uppercase) + Last 4 digits of Mobile
    # Remove spaces and special chars from name
    clean_name = re.sub(r'[^a-zA-Z]', '', name)
    name_part = clean_name[:4].upper()
    
    # Get last 4 digits of mobile
    mobile_str = str(mobile).strip()
    mobile_part = mobile_str[-4:]
    
    return f"{name_part}{mobile_part}"

def main():
    try:
        # Load JSON data
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            registrations = json.load(f)
            
        print(f"Loaded {len(registrations)} students.")
        
        # Prepare CSV Data
        csv_data = []
        for reg in registrations:
            mobile = reg.get('mobile')
            name = reg.get('name')
            
            if mobile and name:
                password = generate_password(name, mobile)
                csv_data.append({
                    'Student Name': name,
                    'Login (Mobile)': mobile,
                    'Password': password,
                    'Email': reg.get('email', '')
                })
        
        # Write to CSV
        if csv_data:
            keys = csv_data[0].keys()
            with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=keys)
                writer.writeheader()
                writer.writerows(csv_data)
            
            print(f"✅ Successfully exported {len(csv_data)} credentials to '{OUTPUT_FILE}'")
        else:
            print("⚠️ No valid student data found to export.")

    except FileNotFoundError:
        print(f"❌ Error: Could not find '{INPUT_FILE}'. Make sure it is in the same folder.")
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")

if __name__ == "__main__":
    main()