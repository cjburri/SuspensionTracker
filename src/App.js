import './App.css';
import { Navbar, Container, Button, Form} from "react-bootstrap";
import { useState } from 'react';

function App() {
  const [isClicked, setIsClicked] = useState(false);

  const playAudio = () => {
    const audio = new Audio('/suspension.mp3');
    audio.play();
    setIsClicked(true); // Trigger the fade-out effect
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
            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Offender</Form.Label>
                <Form.Select>
                  <option>Butters</option>
                  <option>Bizzle</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Ask Butters to add the offender if need be
                </Form.Text>
              </Form.Group>
      
              <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                <Form.Label>Rationale</Form.Label>
                <Form.Control as="textarea" rows={3} />
              </Form.Group>
              <Form.Group>
                <Button style={{width: "100%"}}variant="danger" type="submit">
                  Cancel
                </Button>
              </Form.Group>
              <Form.Group>
                <Button style={{width: "100%"}}variant="success" type="submit">
                  Submit
                </Button>
              </Form.Group>
            </Form>
          }
        </div>
    </>
  );
}

export default App;
