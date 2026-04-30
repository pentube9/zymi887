import ProjectBrainHeader from '../project-brain/ProjectBrainHeader.jsx';
import ProjectHealthCards from '../project-brain/ProjectHealthCards.jsx';
import RealTimeCoreStatusPanel from '../project-brain/RealTimeCoreStatusPanel.jsx';
import StructureLockStatus from '../project-brain/StructureLockStatus.jsx';
import RiskDetectionBoard from '../project-brain/RiskDetectionBoard.jsx';
import CompletedPendingTracker from '../project-brain/CompletedPendingTracker.jsx';
import SocketEventMapViewer from '../project-brain/SocketEventMapViewer.jsx';
import WebRTCFlowGuard from '../project-brain/WebRTCFlowGuard.jsx';
import RouteMapVisualizer from '../project-brain/RouteMapVisualizer.jsx';
import DesignTokenInspector from '../project-brain/DesignTokenInspector.jsx';
import SharedComponentRegistry from '../project-brain/SharedComponentRegistry.jsx';
import ResponsiveSafetyPanel from '../project-brain/ResponsiveSafetyPanel.jsx';
import FeatureRoadmapBoard from '../project-brain/FeatureRoadmapBoard.jsx';
import SystemChecklistExport from '../project-brain/SystemChecklistExport.jsx';
import AdminInsightSummary from '../project-brain/AdminInsightSummary.jsx';
import MessageSystemHealth from '../project-brain/MessageSystemHealth.jsx';
import CallSystemHealth from '../project-brain/CallSystemHealth.jsx';
import SocketRegistryHealth from '../project-brain/SocketRegistryHealth.jsx';

function ProjectBrainDashboard() {
  return (
    <div className="project-brain-dashboard">
      <ProjectBrainHeader />
      <ProjectHealthCards />
      <RealTimeCoreStatusPanel />
      <StructureLockStatus />
      <RiskDetectionBoard />
      <CompletedPendingTracker />
      <SocketEventMapViewer />
      <WebRTCFlowGuard />
      <RouteMapVisualizer />
      <DesignTokenInspector />
      <AdminInsightSummary />
      <MessageSystemHealth />
      <CallSystemHealth />
      <SocketRegistryHealth />
      <SharedComponentRegistry />
      <ResponsiveSafetyPanel />
      <FeatureRoadmapBoard />
      <SystemChecklistExport />
    </div>
  );
}

export default ProjectBrainDashboard;