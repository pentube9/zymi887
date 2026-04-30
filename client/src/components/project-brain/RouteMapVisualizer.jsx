import { projectBrainData } from './projectBrainData.js';

function RouteMapVisualizer() {
  const { routeMapVisualizer } = projectBrainData;

  const renderRoutes = (routes, title) => (
    <div className="route-group">
      <h4>{title}</h4>
      <ul>
        {routes.map((route, index) => (
          <li key={index}>
            <code>{route.path}</code> - {route.description}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="status-section">
      <h2><span>🗺️</span>{routeMapVisualizer.title}</h2>
      <div className="route-map">
        {renderRoutes(routeMapVisualizer.publicRoutes, "Public Routes")}
        {renderRoutes(routeMapVisualizer.protectedUserRoutes, "Protected User Routes")}
        {renderRoutes(routeMapVisualizer.adminSecureRoutes, "Admin Secure Routes")}
        {renderRoutes(routeMapVisualizer.apiRoutes, "API Routes")}
        {renderRoutes(routeMapVisualizer.socketNamespace, "Socket Namespaces")}
      </div>
    </div>
  );
}

export default RouteMapVisualizer;