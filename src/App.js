import './App.css';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';

const guestListStyles = css`
  background-color: yellow;

  input {
    margin-left: 15px;
  }
`;

function App() {
  const baseUrl = 'http://guest-list-lukasm.herokuapp.com';

  // Input values
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [attending, setAttending] = useState(false);

  // Loading feature
  const [loading, setLoading] = useState(false);

  // Local List for display
  const [guestsList, setGuestsList] = useState([]);

  // Input disable feature
  const [form, setForm] = useState(false);

  // Refetching dependency
  const [refetch, setRefetch] = useState(false);

  // Delete function
  async function deleteGuest(id) {
    const reply = await fetch(`${baseUrl}/guests/${id}`, {
      method: 'DELETE',
    });
    const deletedGuest = await reply.json();
    setRefetch(!refetch);
    console.log(`deleted guest: ${deletedGuest}`);
  }

  // Adding guest function
  async function addGuest() {
    const response = await fetch(`${baseUrl}/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: first,
        lastName: last,
      }),
    });
    const newGuest = await response.json();
    setRefetch(!refetch);
    console.log(`guest:${JSON.stringify(newGuest)}`);
  }

  // Last Name input field serves as a starter
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setLast('');
      setFirst('');
      setForm(true);
      setLoading(true);
      addGuest().catch(() => {
        console.log('fetch fails');
      });
    }
  };

  async function handleAttending(id) {
    const response = await fetch(`${baseUrl}/guests/${id}`, {
      // id is already created now I need to identify it.
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attending: !attending }),
    });
    const updatedGuest = await response.json();
    setRefetch(!refetch);
    console.log(`attendance ${JSON.stringify(updatedGuest)}`);
    console.log(attending);
  }

  // Show the whole list

  useEffect(() => {
    async function getList() {
      const responseList = await fetch(`${baseUrl}/guests`);
      const allGuests = await responseList.json();
      setGuestsList(allGuests);
    }
    getList().catch(() => {
      console.log('fetch fails');
    });
    setLoading(false);
  }, [refetch]);

  return loading ? (
    <h1>loading...</h1>
  ) : (
    <>
      <h1>Guest List</h1>
      <div data-test-id="guest" css={guestListStyles}>
        <form>
          <fieldset disabled={form}>
            <label>
              First name
              <input
                value={first}
                onChange={(event) => setFirst(event.currentTarget.value)}
              />
            </label>
            <br />
            <label>
              Last name
              <input
                value={last}
                onKeyDown={handleKeyDown}
                onChange={(event) => setLast(event.currentTarget.value)}
              />
            </label>
          </fieldset>
        </form>
        <div>
          {!guestsList.length ? (
            <div>
              <p>Still no guests</p>
              <img src="/images.png" alt="" />
            </div>
          ) : (
            guestsList.map((guest) => {
              return (
                <div key={`guest id: ${guest.id}`}>
                  <p>First name: {guest.firstName}</p>
                  <p>Last name: {guest.lastName}</p>
                  <p>Attending: {guest.attending ? '✅' : '🛑'}</p>
                  <label>
                    Attending
                    <input
                      aria-label="attending"
                      type="checkbox"
                      value={attending}
                      onChange={(event) => {
                        setAttending(event.currentTarget.checked);
                        handleAttending(guest.id).catch(() => {
                          console.log('fetch fails');
                        });
                        console.log(attending);
                      }}
                    />
                  </label>
                  <button
                    aria-label="Remove"
                    onClick={() => {
                      deleteGuest(guest.id).catch(() => {
                        console.log('fetch fails');
                      });
                      setForm(false);
                    }}
                  >
                    Remove
                  </button>
                  <hr />
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default App;
