package io.hawt.web;

public enum ForbiddenReason {
    NONE,
    HOST_NOT_ALLOWED,
    UNSECURED_CORS_REQUEST,
    SESSION_EXPIRED
}
