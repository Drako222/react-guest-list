import './App.css';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';

// basic styles
const guestListStyles = css`
  background-color: #e6e6ea;

  input {
    margin-left: 15px;
    margin-bottom: 8px;
    padding: 10px;
    border-radius: 10px;
  }

  p {
    border-top: 2px solid black;
    padding: 10px;
  }

  ul {
    list-style-type: none;
  }

  button {
    margin-left: 20px;
    padding: 15px;
    border-radius: 10px;
    cursor: pointer;

    &:hover {
      background-color: #005b96;
    }
  }

  label {
    margin-left: 20px;
  }
`;

const fancyButton = css`
  button {
    margin-top: 20px;
    padding: 15px;
    background-color: #2ab7ca;
    color: white;
    border-radius: 10px;
    cursor: pointer;

    &:hover {
      background-color: #005b96;
    }
  }
`;

function App() {
  const baseUrl = 'https://guest-list-lukasm.herokuapp.com';

  // Input values + toggles
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [attending, setAttending] = useState(false);

  const [form, setForm] = useState(false); // Input disable feature
  const [refetch, setRefetch] = useState(false); // Refetching dependency
  const [loading, setLoading] = useState(false); // Loading feature

  const [guestsList, setGuestsList] = useState([]); // Local List for display

  // Adding guest function
  const addGuest = async () => {
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
    setGuestsList([...guestsList, newGuest]);
    setRefetch(!refetch);
  };

  // Getting all guests - fetch data
  useEffect(() => {
    async function getList() {
      const responseList = await fetch(`${baseUrl}/guests`);
      const response = await responseList.json();
      setGuestsList(response);
      setLoading(false);
    }
    getList().catch(() => {
      console.log('fails');
    });
  }, [refetch]);

  // 1. Press enter in "lat name" input field to add new user
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (!first || !last) {
        alert('Enter last and first name');
      }
      setLoading(true);
      setLast('');
      setFirst('');
      setAttending(false);
      setForm(true);
      addGuest(first, last, attending).catch(() => {
        console.log('fetch fails');
      });
    }
  };

  // Delete function
  const deleteGuest = async (id) => {
    const response = await fetch(`${baseUrl}/guests/${id}`, {
      method: 'DELETE',
    });
    const deletedGuest = await response.json();
    setGuestsList(guestsList.filter((guest) => guest.id !== deletedGuest.id));
  };

  // Delete all function
  const deleteallGuest = async () => {
    for (let i = 0; i < guestsList.length; i++) {
      const guestId = guestsList[i].id;
      const response = await fetch(`${baseUrl}/guests/${guestId}`, {
        method: 'DELETE',
      });
      const deletedGuest = await response.json();
      console.log(deletedGuest);
      setGuestsList([]);
    }
  };

  // Attending checkbox function

  const handleAttending = async (guest) => {
    const response = await fetch(`${baseUrl}/guests/${guest.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attending: guest.attending }),
    });
    const updatedGuest = await response.json();
    console.log(`attendance ${JSON.stringify(updatedGuest)}`);
  };

  const checkedAttending = (id, attendingValue) => {
    const newGuests = [...guestsList];
    const guestSearch = newGuests.find((guest) => guest.id === id);
    guestSearch.attending = attendingValue;
    handleAttending(guestSearch).catch(() => {
      console.log('fetch fails');
    });
    setGuestsList(newGuests);
  };

  // Filter for attending and not attending

  function filterFunctionNon() {
    const filterGuests = [...guestsList];
    const nonAttendingList = filterGuests.filter(
      (guest) => guest.attending === false,
    );
    setGuestsList(nonAttendingList);
  }

  function filterFunctionAt() {
    const filterGuests = [...guestsList];
    const attendingList = filterGuests.filter(
      (guest) => guest.attending === true,
    );
    setGuestsList(attendingList);
  }

  // Reset of the filter

  const resetFunction = async () => {
    const response = await fetch(`${baseUrl}/guests`);
    const result = await response.json();
    setGuestsList(result);
  };

  // render of the page

  return loading ? (
    <h1>loading...</h1>
  ) : (
    <>
      <h1>Guest List</h1>
      <div data-test-id="guest" css={guestListStyles}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <fieldset disabled={form}>
            <label>
              First name
              <input
                placeholder="First name"
                value={first}
                onChange={(event) => setFirst(event.currentTarget.value)}
              />
            </label>
            <br />
            <label>
              Last name
              <input
                placeholder="Last name"
                value={last}
                onKeyDown={handleKeyDown}
                onChange={(event) => setLast(event.currentTarget.value)}
              />
            </label>
          </fieldset>
        </form>
        <ul>
          {!guestsList.length ? (
            <div>
              <p>No guests to display</p>
            </div>
          ) : (
            guestsList.map((guest) => {
              return (
                <div
                  key={`guest id: ${guest.id}`}
                  style={{ backgroundColor: guest.attending ? 'green' : 'red' }}
                >
                  <li>
                    <p>
                      First name: {guest.firstName} Last name: {guest.lastName}
                    </p>
                    <label>
                      Attendance:
                      <input
                        type="checkbox"
                        value="attending"
                        checked={guest.attending}
                        onChange={(event) =>
                          checkedAttending(
                            guest.id,
                            event.currentTarget.checked,
                          )
                        }
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
                  </li>
                </div>
              );
            })
          )}
        </ul>
        <div css={fancyButton}>
          <button onClick={() => filterFunctionAt()}>Filter Attending</button>
          <button
            onClick={() => {
              filterFunctionNon();
            }}
          >
            Non Attending Filter
          </button>
          <button
            onClick={() => {
              resetFunction().catch(() => {
                console.log('fetch fails');
              });
            }}
          >
            Reset Filter
          </button>
          <button
            onClick={() => {
              deleteallGuest().catch(() => {
                console.log('fetch fails');
              });
            }}
          >
            Delete all
          </button>
        </div>
        <hr />
      </div>
    </>
  );
}

export default App;
