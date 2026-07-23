export class ApiResponse {
    static ok(response, data, message = "OK") {
        response.status(200).json({ success: true, message, data });
    }
    static created(response, data, message = "Created") {
        response.status(201).json({ success: true, message, data });
    }
    static badRequest(response, message = "Bad Request") {
        response.status(400).json({ success: false, message });
    }
    static notFound(response, message = "Not Found") {
        response.status(404).json({ success: false, message });
    }
}
