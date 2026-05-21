// Hand-written OpenAPI 3.0 spec for the Aurelia API.
// Kept in code so swagger-ui-express can serve it and types stay close to routes.

export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Aurelia Hotel API",
    version: "1.0.0",
    description:
      "Booking, rooms, testimonials, gallery and uploads for the Aurelia luxury hotel platform."
  },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
    },
    schemas: {
      Room: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          slug: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          capacity: { type: "integer" },
          images: { type: "array", items: { type: "string" } },
          amenities: { type: "array", items: { type: "string" } },
          active: { type: "boolean" }
        }
      },
      Booking: {
        type: "object",
        properties: {
          id: { type: "string" },
          guestName: { type: "string" },
          guestEmail: { type: "string", format: "email" },
          guestPhone: { type: "string", nullable: true },
          notes: { type: "string", nullable: true },
          roomId: { type: "string" },
          checkIn: { type: "string", format: "date-time" },
          checkOut: { type: "string", format: "date-time" },
          guests: { type: "integer" },
          totalPrice: { type: "number" },
          status: {
            type: "string",
            enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]
          }
        }
      },
      LoginBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" }
        }
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              role: { type: "string", enum: ["ADMIN", "GUEST"] }
            }
          }
        }
      },
      ApiError: {
        type: "object",
        properties: {
          message: { type: "string" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: { path: { type: "string" }, message: { type: "string" } }
            }
          }
        }
      }
    }
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["health"],
        summary: "Liveness probe",
        responses: { "200": { description: "OK" } }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["auth"],
        summary: "Admin login",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginBody" } }
          }
        },
        responses: {
          "200": {
            description: "Token issued",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } }
            }
          },
          "401": { description: "Invalid credentials" }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["auth"],
        summary: "Current user",
        security: [{ BearerAuth: [] }],
        responses: { "200": { description: "User" }, "401": { description: "Unauthorized" } }
      }
    },
    "/api/rooms": {
      get: {
        tags: ["rooms"],
        summary: "List rooms (public)",
        responses: {
          "200": {
            description: "Rooms",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Room" } }
              }
            }
          }
        }
      },
      post: {
        tags: ["rooms"],
        summary: "Create room (admin)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Room" } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/api/rooms/{slug}": {
      get: {
        tags: ["rooms"],
        summary: "Get room by slug",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: { "200": { description: "Room" }, "404": { description: "Not found" } }
      }
    },
    "/api/bookings/availability": {
      get: {
        tags: ["bookings"],
        summary: "Check date availability for a room",
        parameters: [
          { name: "roomId", in: "query", required: true, schema: { type: "string" } },
          { name: "checkIn", in: "query", required: true, schema: { type: "string", format: "date" } },
          { name: "checkOut", in: "query", required: true, schema: { type: "string", format: "date" } }
        ],
        responses: { "200": { description: "Availability" } }
      }
    },
    "/api/bookings": {
      post: {
        tags: ["bookings"],
        summary: "Create a booking (public)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Booking" } } }
        },
        responses: {
          "201": { description: "Created" },
          "400": { description: "Validation failed" },
          "404": { description: "Room not found" },
          "409": { description: "Dates not available" }
        }
      },
      get: {
        tags: ["bookings"],
        summary: "List bookings (admin)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] }
          }
        ],
        responses: { "200": { description: "Bookings" } }
      }
    },
    "/api/bookings/{id}/status": {
      put: {
        tags: ["bookings"],
        summary: "Update booking status (admin)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]
                  }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Updated" } }
      }
    },
    "/api/testimonials": {
      get: { tags: ["testimonials"], summary: "List testimonials", responses: { "200": { description: "OK" } } },
      post: {
        tags: ["testimonials"],
        summary: "Create testimonial (admin)",
        security: [{ BearerAuth: [] }],
        responses: { "201": { description: "Created" } }
      }
    },
    "/api/gallery": {
      get: {
        tags: ["gallery"],
        summary: "List gallery items",
        parameters: [
          {
            name: "category",
            in: "query",
            schema: {
              type: "string",
              enum: ["ROOMS", "RESTAURANT", "SPA", "EVENTS", "EXTERIOR", "LIFESTYLE"]
            }
          }
        ],
        responses: { "200": { description: "OK" } }
      }
    },
    "/api/uploads/image": {
      post: {
        tags: ["uploads"],
        summary: "Upload an image (admin) — multipart/form-data field 'image'",
        security: [{ BearerAuth: [] }],
        responses: { "201": { description: "Uploaded" } }
      }
    },
    "/api/admin/requests": {
      get: {
        tags: ["admin"],
        summary: "Recent API requests (admin observability)",
        security: [{ BearerAuth: [] }],
        responses: { "200": { description: "Request log" } }
      },
      delete: {
        tags: ["admin"],
        summary: "Clear request log (admin)",
        security: [{ BearerAuth: [] }],
        responses: { "200": { description: "Cleared" } }
      }
    }
  }
} as const;
