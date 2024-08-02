import React, { useState } from 'react';
import './Dashboard.css';
import preprodcorpGif from './assets/images/logo.gif';

const Dashboard = ({ onLogout }) => {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [transformationMessage, setTransformationMessage] = useState('');
  const [freezeMessage, setFreezeMessage] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('Data Ingestion');
  const [trainingParams, setTrainingParams] = useState({
    training_percentage: 80,
    testing_percentage: 20,
    criterion: 'gini',
    max_depth: 10,
    n_estimators: 100,
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleIngest = async () => {
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResults(data);
      setMessage('Data ingested and models trained successfully!');
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error uploading file.');
    }
  };

  const handleTransformation = async (transformation, features) => {
    if (!file) {
      setTransformationMessage('Please upload a file first.');
      return;
    }

    const transformedFilePath = results['Random Forest'].model_path; // Using random forest model path for example

    try {
      const response = await fetch('http://127.0.0.1:5000/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transformation,
          features,
          file_path: transformedFilePath
        }),
      });

      const data = await response.json();
      setTransformationMessage(data.message);
    } catch (error) {
      console.error('Error:', error);
      setTransformationMessage('Error transforming data.');
    }
  };

  const handleFreeze = async () => {
    if (!results) {
      setFreezeMessage('Please train models first.');
      return;
    }

    const modelPaths = {};
    for (const model in results) {
      modelPaths[model] = results[model].model_path;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/freeze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model_paths: modelPaths }),
      });

      const data = await response.json();
      setFreezeMessage(data.message);
    } catch (error) {
      console.error('Error:', error);
      setFreezeMessage('Error freezing models.');
    }
  };

  const handleAutoTrain = async () => {
    if (!file) {
      setMessage('Please upload a file first.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_path: URL.createObjectURL(file),
          ...trainingParams
        }),
      });

      const data = await response.json();
      setResults(data);
      setMessage('Models trained successfully!');
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error training models.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Data Ingestion':
        return (
          <>
            <div className="input-group">
              <label>Upload File</label>
              <input type="file" onChange={handleFileChange} />
            </div>
            <button className="ingest-button" onClick={handleIngest}>Ingest</button>
            {message && <div className="message">{message}</div>}
            {results && (
              <div className="results">
                <h3>Model Results</h3>
                <ul>
                  {Object.keys(results).map((model) => (
                    <li key={model}>
                      <strong>{model}</strong>: Accuracy = {results[model].accuracy}, RMSE = {results[model].rmse}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        );
      case 'Data Transformation':
        return (
          <div className="transformation-content">
            <div className="input-group">
              <label>Remove features (comma separated)</label>
              <input type="text" onBlur={(e) => handleTransformation('remove_features', e.target.value.split(','))} />
            </div>
            <div className="input-group">
              <label>Convert to numbers (comma separated)</label>
              <input type="text" onBlur={(e) => handleTransformation('convert_to_numbers', e.target.value.split(','))} />
            </div>
            {transformationMessage && <div className="message">{transformationMessage}</div>}
          </div>
        );
      case 'Auto Train ML models':
        return (
          <div className="auto-train-content">
            <div className="input-group">
              <label>Training Percentage</label>
              <input
                type="number"
                value={trainingParams.training_percentage}
                onChange={(e) => setTrainingParams({ ...trainingParams, training_percentage: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Testing Percentage</label>
              <input
                type="number"
                value={trainingParams.testing_percentage}
                onChange={(e) => setTrainingParams({ ...trainingParams, testing_percentage: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Criterion</label>
              <input
                type="text"
                value={trainingParams.criterion}
                onChange={(e) => setTrainingParams({ ...trainingParams, criterion: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Max Depth</label>
              <input
                type="number"
                value={trainingParams.max_depth}
                onChange={(e) => setTrainingParams({ ...trainingParams, max_depth: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Number of Estimators</label>
              <input
                type="number"
                value={trainingParams.n_estimators}
                onChange={(e) => setTrainingParams({ ...trainingParams, n_estimators: e.target.value })}
              />
            </div>
            <button className="auto-train-button" onClick={handleAutoTrain}>Train Models</button>
            {message && <div className="message">{message}</div>}
            {results && (
              <div className="results">
                <h3>Model Results</h3>
                <ul>
                  {Object.keys(results).map((model) => (
                    <li key={model}>
                      <strong>{model}</strong>: Accuracy = {results[model].accuracy}, RMSE = {results[model].rmse}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 'Freeze the learnings':
        return (
          <div className="freeze-content">
            <button className="freeze-button" onClick={handleFreeze}>Freeze Models</button>
            {freezeMessage && <div className="message">{freezeMessage}</div>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <header className="app-header">
        <img src={preprodcorpGif} alt="preprodcorp Logo" className="app-logo" />
      </header>
      <nav className="app-nav">
        {['Data Ingestion', 'Data Transformation', 'Auto Train ML models', 'Freeze the learnings'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
      <main className="content">
        {renderContent()}
      </main>
      <footer className="app-footer">
        <button className="logout-button" onClick={onLogout}>
          <span className="power-icon"></span>
        </button>
      </footer>
    </div>
  );
};

export default Dashboard;
    