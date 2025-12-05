import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Strong, Button, Stack, ButtonGroup, SectionMessage, useProductContext, Link } from '@forge/react';
import { invoke, view } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    invoke('getSprintData')
      .then((res) => {
        if (res.error) {
          setError(res.error);
        } else {
          setData(res);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load data: " + err.message);
        setLoading(false);
      });
  }, []);

  const handleGenerate = async () => {
    setPublishing(true);
    try {
      const res = await invoke('publishRetrospective', {
        sprintName: data.sprintName,
        stats: data,
        aiInsights: "Report generated via SprintPilot." // Placeholder, could add text input
      });
      if (res.success) {
        setResult(res.link);
      } else {
        setError(res.message || "Failed to publish.");
      }
    } catch (e) {
      setError("Error publishing: " + e.message);
    }
    setPublishing(false);
  };

  if (loading) return <Text>Loading Sprint context...</Text>;
  if (error) return <SectionMessage appearance="error"><Text>{error}</Text></SectionMessage>;
  if (!data) return <Text>No sprint data available.</Text>;

  return (
    <Stack space="space.200">
      <Text><Strong>Sprint:</Strong> {data.sprintName}</Text>
      <Text><Strong>Goal:</Strong> {data.sprintGoal}</Text>

      <Stack space="space.100">
        <Text>✅ Completed: {data.completed}</Text>
        <Text>🚧 In Progress: {data.inProgress}</Text>
        <Text>📝 To Do: {data.toDo}</Text>
        <Text>📊 Total Issues: {data.total}</Text>
      </Stack>

      {result ? (
        <SectionMessage appearance="success">
          <Text>Retrospective Published!</Text>
          <Text><Link href={result} openNewTab>View in Confluence</Link></Text>
        </SectionMessage>
      ) : (
        <ButtonGroup>
          <Button appearance="primary" isLoading={publishing} onClick={handleGenerate}>
            Generate Retrospective Report
          </Button>
        </ButtonGroup>
      )}
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
