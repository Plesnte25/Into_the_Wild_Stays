export default function ConfirmDialog({
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  confirmTone = "primary", // 'primary' | 'danger'
  onCancel,
  onConfirm,
}) {
  const confirmClass =
    confirmTone === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-amber-500 hover:bg-amber-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="border-b px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="px-5 py-4 text-sm text-slate-700">{description}</div>
        <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
          <button
            onClick={onCancel}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm text-white ${confirmClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
