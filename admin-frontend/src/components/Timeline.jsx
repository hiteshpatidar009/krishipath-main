export default function Timeline({ events }) {
  return (
    <div className="border-l-4 border-blue-600 pl-4">
      {events.map((event, i) => (
        <div key={i} className="mb-4">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-blue-600 rounded-full mr-3"></span>
            <p className="font-semibold">{event.status}</p>
          </div>
          <p className="ml-6 text-gray-600">{event.activity}</p>
          <p className="ml-6 text-sm text-gray-400">{event.date}</p>
        </div>
      ))}
    </div>
  );
}
