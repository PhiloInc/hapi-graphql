'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _stream = require('stream');

var _graphql = require('graphql');

var _package = require('../package.json');

var _graphiQL = require('./graphiQL');

var _accepts = require('accepts');

var _accepts2 = _interopRequireDefault(_accepts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Define constants
 */
var optionsSchema = {
  query: [_joi2.default.func(), _joi2.default.object({
    schema: _joi2.default.object().required(),
    context: _joi2.default.object(),
    rootValue: _joi2.default.object(),
    pretty: _joi2.default.boolean(),
    graphiql: _joi2.default.boolean(),
    formatError: _joi2.default.func(),
    validationRules: _joi2.default.array()
  }).required()],
  route: _joi2.default.object().keys({
    path: _joi2.default.string().required(),
    config: _joi2.default.object()
  }).required()
};

/**
 * Define helper: get options from object/function
 */
/**
 * Import dependencies
 */
var getOptions = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(options, request) {
    var optionsData, validation;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _promise2.default.resolve(typeof options === 'function' ? options(request) : options);

          case 2:
            optionsData = _context.sent;


            // Validate options
            validation = _joi2.default.validate(optionsData, optionsSchema.query);

            if (!validation.error) {
              _context.next = 6;
              break;
            }

            throw validation.error;

          case 6:
            return _context.abrupt('return', validation.value);

          case 7:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));
  return function getOptions(_x, _x2) {
    return ref.apply(this, arguments);
  };
}();

/**
 * Define helper: parse payload
 */
var parsePayload = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(request) {
    var result, formattedResult;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return new _promise2.default(function (resolve) {
              if (request.payload instanceof _stream.Stream) {
                (function () {
                  var data = '';
                  request.payload.on('data', function (chunk) {
                    data += chunk;
                  });
                  request.payload.on('end', function () {
                    return resolve(data);
                  });
                })();
              } else {
                resolve('{}');
              }
            });

          case 2:
            result = _context2.sent;


            // Return normalized payload
            formattedResult = null;

            if (request.mime === 'application/graphql') {
              formattedResult = { query: result };
            } else {
              formattedResult = JSON.parse(result);
            }
            return _context2.abrupt('return', formattedResult);

          case 6:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));
  return function parsePayload(_x3) {
    return ref.apply(this, arguments);
  };
}();

/**
 * Define helper: get GraphQL parameters from query/payload
 */
var getGraphQLParams = function getGraphQLParams(request) {
  var payload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  // GraphQL Query string.
  var query = request.query.query || payload.query;

  // Parse the variables if needed.
  var variables = request.query.variables || payload.variables;
  if (variables && typeof variables === 'string') {
    try {
      variables = JSON.parse(variables);
    } catch (error) {
      throw _boom2.default.badRequest('Variables are invalid JSON.');
    }
  }

  // Name of GraphQL operation to execute.
  var operationName = request.query.operationName || payload.operationName;

  // Return params
  return { query: query, variables: variables, operationName: operationName };
};

/**
 * Helper function to determine if GraphiQL can be displayed.
 */
var canDisplayGraphiQL = function canDisplayGraphiQL(request, data) {
  // If `raw` exists, GraphiQL mode is not enabled.
  var raw = request.query.raw !== undefined || data.raw !== undefined;

  // Allowed to show GraphiQL if not requested as raw and this request
  // prefers HTML over JSON.
  var accept = (0, _accepts2.default)(request.raw.req);
  return !raw && accept.type(['json', 'html']) === 'html';
};

var createResult = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(_ref) {
    var context = _ref.context;
    var operationName = _ref.operationName;
    var query = _ref.query;
    var request = _ref.request;
    var rootValue = _ref.rootValue;
    var schema = _ref.schema;
    var showGraphiQL = _ref.showGraphiQL;
    var validationRules = _ref.validationRules;
    var variables = _ref.variables;
    var source, documentAST, validationErrors, operationAST;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (query) {
              _context3.next = 4;
              break;
            }

            if (!showGraphiQL) {
              _context3.next = 3;
              break;
            }

            return _context3.abrupt('return', null);

          case 3:
            throw _boom2.default.badRequest('Must provide query string.');

          case 4:

            // GraphQL source.
            source = new _graphql.Source(query, 'GraphQL request');

            // Parse source to AST, reporting any syntax error.

            documentAST = void 0;
            _context3.prev = 6;

            documentAST = (0, _graphql.parse)(source);
            _context3.next = 13;
            break;

          case 10:
            _context3.prev = 10;
            _context3.t0 = _context3['catch'](6);
            throw _boom2.default.badRequest('Syntax error', [_context3.t0]);

          case 13:

            // Validate AST, reporting any errors.
            validationErrors = (0, _graphql.validate)(schema, documentAST, validationRules);

            if (!(validationErrors.length > 0)) {
              _context3.next = 16;
              break;
            }

            throw _boom2.default.badRequest('Validation error', validationErrors);

          case 16:
            if (!(request.method === 'get')) {
              _context3.next = 22;
              break;
            }

            // Determine if this GET request will perform a non-query.
            operationAST = (0, _graphql.getOperationAST)(documentAST, operationName);

            if (!(operationAST && operationAST.operation !== 'query')) {
              _context3.next = 22;
              break;
            }

            if (!showGraphiQL) {
              _context3.next = 21;
              break;
            }

            return _context3.abrupt('return', null);

          case 21:
            throw _boom2.default.methodNotAllowed('Can only perform a ' + operationAST.operation + ' operation from a POST request.');

          case 22:
            _context3.prev = 22;
            _context3.next = 25;
            return (0, _graphql.execute)(schema, documentAST, rootValue, context, variables, operationName);

          case 25:
            return _context3.abrupt('return', _context3.sent);

          case 28:
            _context3.prev = 28;
            _context3.t1 = _context3['catch'](22);
            throw _boom2.default.badRequest('Context error', [_context3.t1]);

          case 31:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined, [[6, 10], [22, 28]]);
  }));
  return function createResult(_x5) {
    return ref.apply(this, arguments);
  };
}();

/**
 * Define handler
 */
var handler = function handler(route) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  return function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(request, reply) {
      var errorFormatter, _ref2,
      // Get GraphQL options given this request.
      schema, context, rootValue, pretty, graphiql, customFormatError, additionalValidationRules, validationRules, payload, showGraphiQL, _getGraphQLParams,

      // Get GraphQL params from the request and POST body data.
      query, variables, operationName, result, _error$output$statusC,
      // Return error, picking up Boom overrides
      statusCode, errors;

      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              errorFormatter = _graphql.formatError;
              _context4.prev = 1;
              _context4.next = 4;
              return getOptions(options, request);

            case 4:
              _ref2 = _context4.sent;
              schema = _ref2.schema;
              context = _ref2.context;
              rootValue = _ref2.rootValue;
              pretty = _ref2.pretty;
              graphiql = _ref2.graphiql;
              customFormatError = _ref2.formatError;
              additionalValidationRules = _ref2.validationRules;
              validationRules = _graphql.specifiedRules;

              if (additionalValidationRules) {
                validationRules = validationRules.concat(additionalValidationRules);
              }

              if (customFormatError) {
                errorFormatter = customFormatError;
              }

              // GraphQL HTTP only supports GET and POST methods.

              if (!(request.method !== 'get' && request.method !== 'post')) {
                _context4.next = 17;
                break;
              }

              throw _boom2.default.methodNotAllowed('GraphQL only supports GET and POST requests.');

            case 17:
              _context4.next = 19;
              return parsePayload(request);

            case 19:
              payload = _context4.sent;


              // Can we show graphiQL?
              showGraphiQL = graphiql && canDisplayGraphiQL(request, payload);
              _getGraphQLParams = getGraphQLParams(request, payload);
              query = _getGraphQLParams.query;
              variables = _getGraphQLParams.variables;
              operationName = _getGraphQLParams.operationName;

              // Create the result

              _context4.next = 27;
              return createResult({
                context: context,
                operationName: operationName,
                query: query,
                request: request,
                rootValue: rootValue,
                schema: schema,
                showGraphiQL: showGraphiQL,
                validationRules: validationRules,
                variables: variables
              });

            case 27:
              result = _context4.sent;


              // Format any encountered errors.
              if (result && result.errors) {
                result.errors = result.errors.map(errorFormatter);
              }

              // If allowed to show GraphiQL, present it instead of JSON.
              if (showGraphiQL) {
                reply((0, _graphiQL.renderGraphiQL)({ query: query, variables: variables, operationName: operationName, result: result })).type('text/html');
              } else {
                // Otherwise, present JSON directly.
                reply((0, _stringify2.default)(result, null, pretty ? 2 : 0)).type('application/json');
              }
              _context4.next = 38;
              break;

            case 32:
              _context4.prev = 32;
              _context4.t0 = _context4['catch'](1);
              _error$output$statusC = _context4.t0.output.statusCode;
              statusCode = _error$output$statusC === undefined ? 500 : _error$output$statusC;
              errors = _context4.t0.data || [_context4.t0];

              reply({ errors: errors.map(errorFormatter) }).code(statusCode);

            case 38:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined, [[1, 32]]);
    }));
    return function (_x7, _x8) {
      return ref.apply(this, arguments);
    };
  }();
};

/**
 * Define handler defaults
 */
handler.defaults = function (method) {
  if (method === 'post') {
    return {
      payload: {
        output: 'stream'
      }
    };
  }
  return {};
};

/**
 * Define plugin
 */
function register(server) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var next = arguments[2];

  // Validate options
  var validation = _joi2.default.validate(options, optionsSchema);
  if (validation.error) {
    throw validation.error;
  }
  var _validation$value = validation.value;
  var route = _validation$value.route;
  var query = _validation$value.query;

  // Register handler

  server.handler('graphql', handler);

  // Register route
  server.route({
    method: ['get', 'post'],
    path: route.path,
    config: route.config,
    handler: {
      graphql: query
    }
  });

  // Done
  return next();
}

/**
 * Define plugin attributes
 */
register.attributes = { name: 'graphql', version: _package.version };

/**
 * Export plugin
 */
exports.default = register;