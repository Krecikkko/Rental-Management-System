export function Input({ label, ...props }: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-900">{label}</label>}
      <input
        {...props}
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:outline-none sm:text-base"
      />
    </div>
  );
}

export function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 transition ${className}`}
    >
      {children}
    </button>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-sm mx-auto p-6 rounded-2xl border border-gray-200 bg-white shadow-md space-y-4">
      {children}
    </div>
  );
}
