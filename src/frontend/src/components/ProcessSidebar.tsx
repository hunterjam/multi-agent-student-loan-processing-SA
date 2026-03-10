import {
  Text,
  Caption1,
  Subtitle2,
  Badge,
  makeStyles,
  tokens,
  mergeClasses,
} from "@fluentui/react-components";
import {
  CheckmarkCircleFilled,
  CircleRegular,
  ClockRegular,
  DismissCircleFilled,
  DocumentRegular,
} from "@fluentui/react-icons";
import { LoanStage } from "../services/api";

interface ProcessSidebarProps {
  applicationId?: string;
  stages?: LoanStage[];
  note?: string;
}

const defaultStages: LoanStage[] = [
  { id: "application_initiated", title: "Application Initiated", description: "Documents received", status: "pending", icon: "document" },
  { id: "identity_verification", title: "Identity Verification", description: "Document validation", status: "pending", icon: "shield-check" },
  { id: "financial_assessment", title: "Financial Assessment", description: "Credit & income review", status: "pending", icon: "currency-dollar" },
  { id: "underwriting_review", title: "Underwriting Review", description: "Risk evaluation", status: "pending", icon: "clipboard-check" },
  { id: "approval_disbursement", title: "Approval & Disbursement", description: "Final decision", status: "pending", icon: "check-circle" },
];

const useStyles = makeStyles({
  root: {
    width: "320px",
    backgroundColor: tokens.colorNeutralBackground6,
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    height: "100vh",
    padding: "24px",
    overflowY: "auto",
    flexShrink: 0,
  },
  headerSection: {
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  headerIcon: {
    width: "32px",
    height: "32px",
    backgroundColor: tokens.colorBrandBackground,
    borderRadius: tokens.borderRadiusMedium,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stagesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  stageCard: {
    display: "flex",
    gap: "16px",
    padding: "12px",
    borderRadius: tokens.borderRadiusMedium,
    transition: "background-color 0.15s ease",
  },
  stageActive: {
    backgroundColor: `color-mix(in srgb, ${tokens.colorBrandBackground} 10%, transparent)`,
    border: `1px solid color-mix(in srgb, ${tokens.colorBrandBackground} 30%, transparent)`,
  },
  stageCompleted: {
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground3} 50%, transparent)`,
  },
  stageError: {
    backgroundColor: `color-mix(in srgb, ${tokens.colorPaletteRedBackground1} 30%, transparent)`,
    border: `2px solid ${tokens.colorPaletteRedBorder1}`,
  },
  stagePending: {
    backgroundColor: "transparent",
  },
  stageContent: {
    flex: 1,
    minWidth: 0,
  },
  stageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "8px",
  },
  connector: {
    marginLeft: "22px",
    height: "16px",
    width: "2px",
    backgroundColor: tokens.colorNeutralStroke2,
  },
  noteBox: {
    marginTop: "32px",
    padding: "16px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: `color-mix(in srgb, ${tokens.colorBrandBackground} 10%, transparent)`,
    border: `1px solid color-mix(in srgb, ${tokens.colorBrandBackground} 20%, transparent)`,
  },
});

export function ProcessSidebar({ applicationId = "#LA-2025-1847", stages = defaultStages, note }: ProcessSidebarProps) {
  const styles = useStyles();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckmarkCircleFilled style={{ fontSize: 20, color: tokens.colorPaletteGreenForeground1 }} />;
      case "active":
        return <ClockRegular style={{ fontSize: 20, color: tokens.colorBrandForeground1 }} />;
      case "error":
        return <DismissCircleFilled style={{ fontSize: 28, color: tokens.colorPaletteRedForeground1 }} />;
      default:
        return <CircleRegular style={{ fontSize: 20, color: tokens.colorNeutralForeground4 }} />;
    }
  };

  const getStageClass = (status: string) => {
    switch (status) {
      case "active": return styles.stageActive;
      case "completed": return styles.stageCompleted;
      case "error": return styles.stageError;
      default: return styles.stagePending;
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.headerSection}>
        <div className={styles.headerRow}>
          <div className={styles.headerIcon}>
            <DocumentRegular style={{ fontSize: 20, color: tokens.colorNeutralForegroundOnBrand }} />
          </div>
          <Subtitle2>Loan Application</Subtitle2>
        </div>
        <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
          Application ID: {applicationId}
        </Caption1>
      </div>

      <div className={styles.stagesContainer}>
        {stages.map((stage, index) => (
          <div key={stage.id}>
            <div className={mergeClasses(styles.stageCard, getStageClass(stage.status))}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                {getStatusIcon(stage.status)}
              </div>
              <div className={styles.stageContent}>
                <div className={styles.stageHeader}>
                  <div style={{ flex: 1 }}>
                    <Text weight="semibold" size={200} style={{ display: "block", marginBottom: 2 }}>
                      {stage.title}
                    </Text>
                    <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                      {stage.description}
                    </Caption1>
                  </div>
                  {stage.status === "active" && (
                    <Badge appearance="filled" color="brand" size="small">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {index < stages.length - 1 && <div className={styles.connector} />}
          </div>
        ))}
      </div>

      {note && (
        <div className={styles.noteBox}>
          <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>
            <Text style={{ color: tokens.colorBrandForeground1 }}>&#9432; Note:</Text> {note}
          </Caption1>
        </div>
      )}
    </div>
  );
}
