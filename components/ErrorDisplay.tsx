interface ErrorDisplayProps {
  error: string;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
      <p className="text-sm text-gray-800">
        <strong>Error:</strong> {error}
      </p>
      {error.includes('access token') && (
        <p className="text-sm text-gray-600 mt-2">
          Please sign out and sign in again with Google to grant Gmail access.
        </p>
      )}
    </div>
  );
}
