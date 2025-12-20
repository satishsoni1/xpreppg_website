export default function UserInfoSection({ form }: any) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-sm">Full Name</label>
          <input className="input" value={form.fullName} readOnly />
        </div>
  
        <div>
          <label className="text-sm">Email</label>
          <input className="input" value={form.email} readOnly />
        </div>
  
        <div className="md:col-span-2">
          <label className="text-sm">Phone</label>
          <input className="input" value={form.phone} readOnly />
        </div>
      </div>
    );
  }
  