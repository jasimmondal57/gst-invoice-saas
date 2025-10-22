const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// ===== COMPRESSION MIDDLEWARE =====
const compressionMiddleware = compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// ===== SECURITY MIDDLEWARE =====
const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
});

// ===== RATE LIMITING =====
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// ===== DATA SANITIZATION =====
const dataSanitization = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Potential NoSQL injection attempt detected in ${key}`);
  },
});

// ===== PARAMETER POLLUTION PREVENTION =====
const parameterPollutionPrevention = hpp({
  whitelist: [
    'sort',
    'fields',
    'page',
    'limit',
    'search',
    'filter',
    'startDate',
    'endDate',
  ],
});

// ===== CACHING MIDDLEWARE =====
const cacheMiddleware = (duration = 3600) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = '__express__' + req.originalUrl || req.url;
    const cachedBody = req.app.locals.cache && req.app.locals.cache[key];

    if (cachedBody) {
      res.set('X-Cache', 'HIT');
      res.send(cachedBody);
      return;
    }

    res.set('X-Cache', 'MISS');
    res.sendResponse = res.send;
    res.send = (body) => {
      if (req.app.locals.cache) {
        req.app.locals.cache[key] = body;
        setTimeout(() => {
          delete req.app.locals.cache[key];
        }, duration * 1000);
      }
      res.sendResponse(body);
    };
    next();
  };
};

// ===== REQUEST LOGGING MIDDLEWARE =====
const requestLogging = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };

    if (duration > 1000) {
      console.warn('⚠️ Slow request:', log);
    } else {
      console.log('✓ Request:', log);
    }
  });

  next();
};

// ===== ERROR HANDLING MIDDLEWARE =====
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

// ===== QUERY OPTIMIZATION MIDDLEWARE =====
const queryOptimization = (req, res, next) => {
  // Add default pagination
  if (!req.query.limit) {
    req.query.limit = 20;
  }
  if (!req.query.page) {
    req.query.page = 1;
  }

  // Validate pagination
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);

  req.pagination = {
    limit,
    skip: (page - 1) * limit,
    page,
  };

  next();
};

module.exports = {
  compressionMiddleware,
  securityMiddleware,
  apiLimiter,
  authLimiter,
  dataSanitization,
  parameterPollutionPrevention,
  cacheMiddleware,
  requestLogging,
  errorHandler,
  queryOptimization,
};

