interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

const ErrorState = ({ message = 'Something went wrong', onRetry }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <p className="text-4xl">⚠️</p>
      <p className="text-sm font-semibold text-gray-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export default ErrorState