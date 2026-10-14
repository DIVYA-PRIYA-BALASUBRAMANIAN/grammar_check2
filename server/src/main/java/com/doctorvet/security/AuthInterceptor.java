package com.doctorvet.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final TokenService tokenService;

    public AuthInterceptor(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Allow CORS preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Authentication token missing. Please sign in to access this veterinary resource.");
            return false;
        }

        String token = authHeader.substring(7).trim();
        if (!tokenService.validateToken(token)) {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Session expired or invalid token. Please sign in again.");
            return false;
        }

        Long authenticatedDoctorId = tokenService.getDoctorIdFromToken(token);
        if (authenticatedDoctorId == null) {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid doctor session.");
            return false;
        }

        // Attach authenticated doctor ID to request attributes
        request.setAttribute("authenticatedDoctorId", authenticatedDoctorId);

        // Ownership Verification: Protect against parameter tampering
        // Check if query parameter "doctorId" is passed and matches authenticated user
        String doctorIdParam = request.getParameter("doctorId");
        if (doctorIdParam != null && !doctorIdParam.isBlank()) {
            try {
                Long requestedDocId = Long.parseLong(doctorIdParam);
                if (!requestedDocId.equals(authenticatedDoctorId)) {
                    sendErrorResponse(response, HttpServletResponse.SC_FORBIDDEN,
                            "Access denied: You cannot view or modify another doctor's private records.");
                    return false;
                }
            } catch (NumberFormatException ignored) {}
        }

        // Check if query parameter "currentDoctorId" is passed
        String currentDocIdParam = request.getParameter("currentDoctorId");
        if (currentDocIdParam != null && !currentDocIdParam.isBlank()) {
            try {
                Long requestedDocId = Long.parseLong(currentDocIdParam);
                if (!requestedDocId.equals(authenticatedDoctorId)) {
                    sendErrorResponse(response, HttpServletResponse.SC_FORBIDDEN,
                            "Access denied: Invalid credentials for action.");
                    return false;
                }
            } catch (NumberFormatException ignored) {}
        }

        return true;
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws Exception {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String json = String.format("{\"error\":\"%s\",\"message\":\"%s\",\"status\":%d}",
                status == HttpServletResponse.SC_UNAUTHORIZED ? "Unauthorized" : "Forbidden",
                message, status);
        response.getWriter().write(json);
        response.getWriter().flush();
    }
}
