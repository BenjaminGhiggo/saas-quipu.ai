// MongoDB Setup Script para Quipu.ai
// Ejecutar con: mongosh --host 167.86.90.102 --port 27017 < mongodb-setup.js

// Conectar a la base de datos
use quipu_db;

// Crear colecciones con validación
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "firstName", "lastName", "ruc", "businessName"],
      properties: {
        email: { bsonType: "string", pattern: "^.+@.+$" },
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        ruc: { bsonType: "string", pattern: "^[0-9]{11}$" },
        businessName: { bsonType: "string" },
        subscription: {
          bsonType: "object",
          properties: {
            planType: { enum: ["emprende", "crece", "pro"] },
            status: { enum: ["active", "inactive", "suspended"] }
          }
        },
        profile: {
          bsonType: "object",
          properties: {
            taxRegime: { enum: ["RUS", "RER", "RG"] },
            businessType: { bsonType: "string" }
          }
        }
      }
    }
  }
});

db.createCollection("invoices", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "type", "series", "number", "date", "client", "amounts"],
      properties: {
        userId: { bsonType: "objectId" },
        type: { enum: ["factura", "boleta", "nota_credito", "nota_debito"] },
        series: { bsonType: "string" },
        number: { bsonType: "string" },
        date: { bsonType: "date" },
        client: {
          bsonType: "object",
          required: ["documentType", "documentNumber", "name"],
          properties: {
            documentType: { enum: ["DNI", "RUC", "CE", "PASSPORT"] },
            documentNumber: { bsonType: "string" },
            name: { bsonType: "string" }
          }
        },
        amounts: {
          bsonType: "object",
          required: ["subtotal", "igv", "total"],
          properties: {
            subtotal: { bsonType: "number", minimum: 0 },
            igv: { bsonType: "number", minimum: 0 },
            total: { bsonType: "number", minimum: 0 }
          }
        },
        status: { enum: ["draft", "sent", "accepted", "rejected"] },
        sunatStatus: { enum: ["pending", "sent", "accepted", "rejected"] }
      }
    }
  }
});

db.createCollection("declarations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "period", "regime", "taxes", "status"],
      properties: {
        userId: { bsonType: "objectId" },
        period: {
          bsonType: "object",
          required: ["month", "year", "type"],
          properties: {
            month: { bsonType: "int", minimum: 1, maximum: 12 },
            year: { bsonType: "int", minimum: 2020 },
            type: { enum: ["monthly", "quarterly", "annual"] }
          }
        },
        regime: {
          bsonType: "object",
          required: ["type"],
          properties: {
            type: { enum: ["RUS", "RER", "RG"] }
          }
        },
        taxes: {
          bsonType: "object",
          required: ["igv", "rent"],
          properties: {
            igv: {
              bsonType: "object",
              required: ["collected", "paid", "balance"],
              properties: {
                collected: { bsonType: "number" },
                paid: { bsonType: "number" },
                balance: { bsonType: "number" }
              }
            },
            rent: {
              bsonType: "object",
              required: ["base", "rate", "amount", "balance"],
              properties: {
                base: { bsonType: "number" },
                rate: { bsonType: "number" },
                amount: { bsonType: "number" },
                balance: { bsonType: "number" }
              }
            }
          }
        },
        status: { enum: ["draft", "calculated", "submitted", "paid", "completed"] }
      }
    }
  }
});

db.createCollection("alerts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "type", "priority", "title", "message", "status"],
      properties: {
        userId: { bsonType: "objectId" },
        type: { enum: ["tax_deadline", "invoice_pending", "payment_reminder", "system"] },
        priority: { enum: ["low", "medium", "high", "urgent"] },
        title: { bsonType: "string" },
        message: { bsonType: "string" },
        status: { enum: ["active", "read", "dismissed"] }
      }
    }
  }
});

// Insertar datos de prueba
print("Creando usuario demo...");
const demoUserId = ObjectId();
db.users.insertOne({
  _id: demoUserId,
  email: "demo@quipu.ai",
  firstName: "Demo",
  lastName: "User",
  fullName: "Demo User",
  ruc: "12345678901",
  businessName: "Demo Business SAC",
  phone: "+51 999 888 777",
  address: "Av. Demo 123, Lima, Perú",
  subscription: {
    planType: "emprende",
    status: "active",
    startDate: new Date("2024-01-01"),
    nextBillingDate: new Date("2024-08-01")
  },
  profile: {
    taxRegime: "RER",
    businessType: "Servicios",
    sector: "Tecnología"
  },
  preferences: {
    language: "es",
    timezone: "America/Lima",
    theme: "light",
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  },
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date()
});

print("Creando facturas demo...");
db.invoices.insertMany([
  {
    userId: demoUserId,
    type: "factura",
    series: "F001",
    number: "00000123",
    date: new Date("2024-06-25"),
    client: {
      documentType: "RUC",
      documentNumber: "20123456789",
      name: "Empresa Demo SAC",
      address: "Av. Lima 123, Lima, Perú"
    },
    items: [
      { 
        description: "Servicio de consultoría", 
        quantity: 1, 
        unitPrice: 1000.00, 
        total: 1000.00 
      }
    ],
    amounts: {
      subtotal: 1000.00,
      igv: 180.00,
      total: 1180.00
    },
    status: "sent",
    sunatStatus: "accepted",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: demoUserId,
    type: "boleta",
    series: "B001",
    number: "00000456",
    date: new Date("2024-06-26"),
    client: {
      documentType: "DNI",
      documentNumber: "12345678",
      name: "Juan Pérez García"
    },
    items: [
      { 
        description: "Producto demo", 
        quantity: 2, 
        unitPrice: 50.00, 
        total: 100.00 
      }
    ],
    amounts: {
      subtotal: 100.00,
      igv: 18.00,
      total: 118.00
    },
    status: "draft",
    sunatStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("Creando declaraciones demo...");
db.declarations.insertMany([
  {
    userId: demoUserId,
    period: { month: 6, year: 2024, type: "monthly" },
    regime: { type: "RER", category: "A" },
    sales: { taxable: 5000.00, exempt: 0, total: 5000.00, igvPaid: 0 },
    taxes: {
      igv: { collected: 900.00, paid: 360.00, balance: 540.00 },
      rent: { base: 5000.00, rate: 1.5, amount: 75.00, withheld: 0, balance: 75.00 }
    },
    payment: { 
      totalToPay: 615.00, 
      method: "online", 
      paidAt: new Date("2024-06-15T10:30:00Z") 
    },
    sunat: { 
      status: "accepted", 
      formType: "PDT621", 
      presentationNumber: "PDT202406001" 
    },
    status: "completed",
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-15T10:30:00Z")
  },
  {
    userId: demoUserId,
    period: { month: 5, year: 2024, type: "monthly" },
    regime: { type: "RER", category: "A" },
    sales: { taxable: 4500.00, exempt: 0, total: 4500.00, igvPaid: 0 },
    taxes: {
      igv: { collected: 810.00, paid: 324.00, balance: 486.00 },
      rent: { base: 4500.00, rate: 1.5, amount: 67.50, withheld: 0, balance: 67.50 }
    },
    payment: { 
      totalToPay: 553.50, 
      method: "transfer", 
      paidAt: new Date("2024-05-18T14:20:00Z") 
    },
    sunat: { 
      status: "accepted", 
      formType: "PDT621", 
      presentationNumber: "PDT202405001" 
    },
    status: "completed",
    createdAt: new Date("2024-05-01"),
    updatedAt: new Date("2024-05-18T14:20:00Z")
  }
]);

print("Creando alertas demo...");
db.alerts.insertMany([
  {
    userId: demoUserId,
    type: "tax_deadline",
    priority: "high",
    title: "Declaración de IGV-Renta vence mañana",
    message: "Tu declaración mensual de IGV-Renta del período junio 2024 vence el 12 de julio.",
    dueDate: new Date("2024-07-12T23:59:59Z"),
    status: "active",
    createdAt: new Date("2024-07-10T09:00:00Z")
  },
  {
    userId: demoUserId,
    type: "invoice_pending",
    priority: "medium",
    title: "Tienes 3 boletas por enviar a SUNAT",
    message: "Hay 3 boletas en estado borrador que necesitan ser enviadas a SUNAT.",
    status: "active",
    createdAt: new Date("2024-07-09T15:30:00Z")
  },
  {
    userId: demoUserId,
    type: "payment_reminder",
    priority: "low",
    title: "Recordatorio: Pago programado",
    message: "Tienes un pago programado de S/ 615.00 para el 15 de julio.",
    dueDate: new Date("2024-07-15T10:00:00Z"),
    status: "active",
    createdAt: new Date("2024-07-08T12:00:00Z")
  }
]);

// Crear índices para optimizar consultas
print("Creando índices...");
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "ruc": 1 });
db.invoices.createIndex({ "userId": 1 });
db.invoices.createIndex({ "date": -1 });
db.invoices.createIndex({ "series": 1, "number": 1 }, { unique: true });
db.declarations.createIndex({ "userId": 1 });
db.declarations.createIndex({ "period.year": -1, "period.month": -1 });
db.alerts.createIndex({ "userId": 1, "status": 1 });
db.alerts.createIndex({ "createdAt": -1 });

print("✅ Setup de MongoDB completado!");
print("Base de datos: quipu_db");
print("Colecciones creadas: users, invoices, declarations, alerts");
print("Usuario demo creado: demo@quipu.ai");
print("Datos de prueba insertados correctamente.");

// Mostrar estadísticas
print("\n📊 Estadísticas:");
print("Usuarios: " + db.users.countDocuments());
print("Facturas: " + db.invoices.countDocuments());
print("Declaraciones: " + db.declarations.countDocuments());
print("Alertas: " + db.alerts.countDocuments());