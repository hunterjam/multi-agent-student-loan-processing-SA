import { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Text,
  Caption1,
  Subtitle2,
  Badge,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { PersonRegular } from "@fluentui/react-icons";
import { ProcessSidebar } from "./components/ProcessSidebar";
import { ChatInterface } from "./components/ChatInterface";
import { api, LoanStatusResponse } from "./services/api";

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    display: "flex",
  },
  mainContent: {
    flex: 1,
    overflowY: "auto",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  container: {
    maxWidth: "56rem",
    margin: "0 auto",
    padding: "32px",
  },
  welcomeCard: {
    marginBottom: "24px",
    padding: "32px",
  },
  welcomeCardInner: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  statusBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: tokens.colorPaletteGreenForeground1,
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  },
  chatArea: {
    height: "calc(100vh - 240px)",
  },
});

export default function App() {
  const styles = useStyles();
  const [applicationStarted, setApplicationStarted] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [loanStatus, setLoanStatus] = useState<LoanStatusResponse | null>(null);

  const handleApplicationStart = () => {
    setApplicationStarted(true);
  };

  const handleThreadIdUpdate = (newThreadId: string) => {
    setThreadId(newThreadId);
  };

  useEffect(() => {
    if (!threadId) return;

    let intervalId: NodeJS.Timeout | null = null;

    const pollStatus = async () => {
      try {
        const status = await api.getLoanStatus(threadId);
        setLoanStatus(status);

        if (status.currentState === 'completed') {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      } catch (error) {
        console.error('Failed to fetch loan status:', error);
      }
    };

    pollStatus();
    intervalId = setInterval(pollStatus, 2000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [threadId]);

  return (
    <div className={styles.root}>
      {applicationStarted && (
        <ProcessSidebar
          applicationId={loanStatus?.applicationId}
          stages={loanStatus?.stages}
          note={loanStatus?.note}
        />
      )}

      <div className={styles.mainContent}>
        <div className={styles.container}>
          <Card className={styles.welcomeCard}>
            <div className={styles.welcomeCardInner}>
              <div>
                <Subtitle2 style={{ display: "block", marginBottom: 8 }}>
                  Welcome, Loan Applicant
                </Subtitle2>
                <Text style={{ color: tokens.colorNeutralForeground3 }}>
                  {applicationStarted
                    ? "Your loan application is being processed. Our team will keep you informed of any updates."
                    : "Access professional loan advisory services and explore financing options tailored to your needs."}
                </Text>
              </div>
              <Avatar
                icon={<PersonRegular />}
                color="brand"
                size={48}
                style={{ flexShrink: 0, marginLeft: 16 }}
              />
            </div>
            {applicationStarted && loanStatus && (
              <div className={styles.statusBar}>
                <div className={styles.statusDot} />
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                  Application Status: {loanStatus.currentStage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Caption1>
              </div>
            )}
          </Card>

          <div className={styles.chatArea}>
            <ChatInterface
              onApplicationStart={handleApplicationStart}
              threadId={threadId}
              onThreadIdUpdate={handleThreadIdUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
