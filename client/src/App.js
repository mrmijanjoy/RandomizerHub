import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Table, Form, Button } from 'react-bootstrap';
import { FaFileCsv } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [region, setRegion] = useState('USA');
  const [errors, setErrors] = useState(0);
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000));
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [initialSeed, setInitialSeed] = useState(seed);
  const limit = 20;

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/generate', {
        params: {
          region,
          errors,
          seed,
          page,
          limit
        }
      });
      if (page === 1) {
        setData(res.data.records);
      } else {
        setData(prevData => [...prevData, ...res.data.records]);
      }
    } catch (error) {
      console.error('Error fetching data:', error.response ? error.response.data : error.message);
    }
  }, [region, errors, seed, page]);

  useEffect(() => {
    setPage(1);
    fetchData();
  }, [fetchData, region, errors, seed]);

  const handleScroll = useCallback((e) => {
    if (window.innerHeight + e.target.documentElement.scrollTop + 1 >= e.target.documentElement.scrollHeight) {
      setPage(prevPage => prevPage + 1);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Reset seed
  const resetSeed = () => {
    setSeed(initialSeed);
    setErrors(0);
    setRegion('USA');
  };

  // Predefined demo 
  const demoPredefinedSettings = () => {
    setInitialSeed(seed);  
    setSeed(1234);  
    setErrors(0.5);  
    setTimeout(() => setErrors(5), 2000);  //increase
    setTimeout(() => setErrors(20), 4000);
    setTimeout(() => setErrors(1000), 6000);
    setTimeout(() => setErrors(0), 8000);  //reset
  };

  // CSV Export
  const exportToCSV = () => {
    const csv = Papa.unparse(data, {
      header: true
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'generated_data.csv');
  };

  return (
    <Container>
      <Row className="my-3">
        <Col>
          <Form>
            <Form.Group controlId="regionSelect">
              <Form.Label>Select Region</Form.Label>
              <Form.Control as="select" value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="USA">USA</option>
                <option value="Poland">Poland</option>
                <option value="Georgia">Georgia</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="errors" className="slider-container">
              <Form.Label>Number of Errors per Record</Form.Label>
              <input 
                type="range" 
                className="slider" 
                min="0" 
                max="10" 
                step="0.5"
                value={errors} 
                onChange={(e) => setErrors(e.target.value)} 
              />
              <Form.Control 
                type="number" 
                min="0" 
                max="1000" 
                value={errors} 
                onChange={(e) => setErrors(e.target.value)} 
              />
            </Form.Group>
            <Button className="me-2" onClick={() => setSeed(Math.floor(Math.random() * 1000))}>Generate Data</Button>
            <Button className="me-2" onClick={resetSeed}>Reset Seed</Button>
            <Button onClick={demoPredefinedSettings}>Run Demo</Button>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Index</th>
                <th>Identifier</th>
                <th>Name</th>
                <th>Address</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record, index) => (
                <tr key={index}>
                  <td>{record.index}</td>
                  <td>{record.identifier}</td>
                  <td>{record.name}</td>
                  <td>{record.address}</td>
                  <td>{record.phone}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Button 
        variant="success" 
        onClick={exportToCSV} 
        className="export-button"
      >
        <FaFileCsv /> Export to CSV
      </Button>
    </Container>
  );
}

export default App;
