import './App.css';
import { Navbar, Container, Button, Form } from "react-bootstrap";
import { useState, useEffect, useRef } from 'react';

function App() {
  const [isClicked, setIsClicked] = useState(false);
  const [offenderList, setOffenderList] = useState([]);
  const [selectedOffender, setSelectedOffender] = useState('');
  const [rationale, setRationale] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [offenderInvalid, setOffenderInvalid] = useState(false);
  const [rationaleInvalid, setRationaleInvalid] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const audioRef = useRef(null);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause(); // Stop the currently playing audio
      audioRef.current.currentTime = 0; // Reset playback position to the start
    }

    const newAudio = new Audio('/suspension.mp3');
    newAudio.play();
    audioRef.current = newAudio; // Save the new audio instance

    setIsClicked(true); // Trigger the fade-out effect
  };

  useEffect(() => {
    fetch('http://localhost/offenderList')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setOffenderList(data);
      })
      .catch(error => {
        console.error('Error fetching offender list:', error);
      });
  }, []);

  useEffect(() => {
    validateForm();
  }, [selectedOffender, rationale]);

  const validateForm = () => {
    const isOffenderValid = selectedOffender !== '0' && selectedOffender !== '';
    const isRationaleValid = rationale.length <= 1024 && rationale.length > 0;
    setOffenderInvalid(!isOffenderValid);
    setRationaleInvalid(!isRationaleValid);
    setIsFormValid(isOffenderValid && isRationaleValid);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      offenderId: selectedOffender,
      rationale: rationale
    };

    console.log('Submitting payload:', payload);

    try {
      const response = await fetch('http://localhost/submitSuspension', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Submission successful');
        setSuccessMessage('Submission successfully logged');
        setIsSubmitted(true); // Mark as submitted

        // Reset the form after 5 seconds
        setTimeout(() => {
          handleReset();
        }, 5000);
      } else {
        console.error('Submission failed:', response.statusText);
        // Handle errors
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle errors
    }
  };

  const handleCancel = () => {
    if (audioRef.current) {
      audioRef.current.pause(); // Stop the audio
      audioRef.current = null; // Clear the audio instance
    }
    handleReset();
  };

  const handleReset = () => {
    setSelectedOffender('');
    setRationale('');
    setOffenderInvalid(false);
    setRationaleInvalid(false);
    setIsFormValid(false);
    setIsClicked(false); // Toggle back to initial state
    setIsSubmitted(false); // Reset submission status
    setSuccessMessage(''); // Clear the success message
  };

  return (
    <>
      <Navbar style={{ backgroundColor: "#1C5745" }}>
        <Container className="d-flex justify-content-center">
          <Navbar.Brand href="#home">
            <h1 style={{ stroke: "10px #0A3023", color: "white", fontFamily: "Tourney" }}>
              BRENTWOOD SUSPENS<span style={{ color: "#CD2427" }}>10</span>NS
            </h1>
          </Navbar.Brand>
        </Container>
      </Navbar>

      <div className="button-container">
        {!isClicked &&
          <Button
            variant="danger"
            size="lg"
            onClick={playAudio}
          >
            SUSPEND!
          </Button>
        }
        {isClicked &&
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Offender</Form.Label>
              <Form.Select 
                value={selectedOffender} 
                onChange={(e) => {
                  setSelectedOffender(e.target.value);
                  setOffenderInvalid(e.target.value === '0' || e.target.value === '');
                }}
                isInvalid={offenderInvalid}
              >
                <option key='blank' value={'0'}></option>
                {offenderList.map(offender => {
                  return (
                    <option key={offender.id} value={offender.id}>{offender.nickname}</option>
                  );
                })}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select a valid offender.
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Ask Butters to add the offender if need be
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Rationale</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={rationale}
                onChange={(e) => {
                  setRationale(e.target.value);
                  setRationaleInvalid(e.target.value.length > 1024 || e.target.value.length === 0);
                }}
                isInvalid={rationaleInvalid}
              />
              <Form.Control.Feedback type="invalid">
                Must be 1-1024 characters.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Button className="mb-3" style={{ width: "100%" }} variant="secondary" type="button" onClick={handleCancel}>
                Cancel
              </Button>
            </Form.Group>
            <Form.Group>
              <Button className="mb-3" style={{ width: "100%" }} variant="success" type="submit" disabled={!isFormValid}>
                Submit
              </Button>
            </Form.Group>
            {successMessage && 
              <div className="alert alert-success" role="alert">
                {successMessage}
              </div>
            }
          </Form>
        }
      </div>
    </>
  );
}

export default App;
