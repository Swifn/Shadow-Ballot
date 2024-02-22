import { AuthenticatedRoute } from "../../components/conditional-route";
import styles from "../society/style.module.scss";
import {
  Button,
  ComboBox,
  FileUploader,
  InlineNotification,
  Search,
  TextArea,
  TextInput,
} from "@carbon/react";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Add, PortInput, Close } from "@carbon/icons-react";
import { ElectionModal } from "../../components/election-modal";
import { get, post, postFile } from "../../utils/fetch";
import { Cards } from "../../components/cards";
import { Routes } from "../index";

interface Society {
  societyId: number;
  name: string;
  description: string;
  societySubject: string;
  societyPicture?: string;
}

interface SocietySubject {
  subjectId: number;
  name: string;
}

export const Society = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formEnabled, setFormEnabled] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<number>(0);
  const [joinedSocieties, setJoinedSocieties] = useState<Society[] | null>([]);
  // const [picture, setPicture] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredSocieties, setFilteredSocieties] = useState({});
  const [societiesBySubject, setSocietiesBySubject] = useState({});

  const [getSocietySubject, setGetSocietySubject] = useState<SocietySubject[]>(
    []
  );
  const voterId = localStorage.getItem("USER_ID");

  const searchHandler = event => {
    setSearch(event.target.value);
  };

  // const handleFileUpload = event => {
  //   const file = event.target.files[0];
  //   setPicture(file);
  // };

  const viewSocietyPageHandler = async (societyId: number) => {
    navigate(Routes.SOCIETY_PAGE(societyId.toString()));
  };
  const comboBoxHandler = event => {
    const subjectName = event.selectedItem;
    const subjectId = getSocietySubject.find(
      subject => subject.name === subjectName
    )?.subjectId;
    setSelectedSubject(subjectId!);
  };

  useEffect(() => {
    if (!search) {
      // If the search term is empty, set the filtered societies to the original object
      setFilteredSocieties(societiesBySubject);
      return;
    }
    // Filter the societies by the search term and update the state with the filtered societies object (if there are any)
    const filtered = {};

    // Loop through each subject and filter the societies by the search term
    for (const subject in societiesBySubject) {
      // If the subject doesn't have any societies, skip it
      const societies = societiesBySubject[subject].filter(society =>
        // Check if the society's name includes the search term
        society.name.toLowerCase().includes(search.toLowerCase())
      );

      // If there are any societies for this subject, add them to the filtered object
      if (societies.length > 0) {
        // Add the filtered societies to the filtered object
        filtered[subject] = societies;
      }
    }
    // Update the state with the filtered societies
    setFilteredSocieties(filtered);
  }, [search, societiesBySubject]);

  const fetchData = async () => {
    try {
      const response = await get(`society/get-joined/${voterId}`).then(res =>
        res.json()
      );
      setJoinedSocieties(response.societies);
      const sortedSocieties = response.societies.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setJoinedSocieties(sortedSocieties);
    } catch (error) {
      console.log(`Error when retrieving owned society data: ${error}`);
    }
    try {
      const allSocieties = await get("society/get-all").then(res => res.json());
      const groupedSocieties = groupSocietiesBySubject(allSocieties.societies);
      setSocietiesBySubject(groupedSocieties);
    } catch (error) {
      console.log(`Error when retrieving all society data: ${error}`);
    }
    try {
      const response = await get(`society/get-society-subject`).then(res =>
        res.json()
      );
      setGetSocietySubject(response.subjects);
    } catch (error) {
      console.log(error);
    }
  };

  const groupSocietiesBySubject = societies => {
    // Create an object to group the societies by their subject
    const grouped = {};
    // Loop through each society and group them by their subject
    societies.forEach(society => {
      // Use the society's subject as the key
      const subject = society.societySubject;
      // If we don't have this subject in our grouped object, add it as an empty array to start with
      if (!grouped[subject]) {
        // Add the subject as a key in the grouped object
        grouped[subject] = [];
      }
      // Add the society to the correct group
      grouped[subject].push(society);
    });
    return grouped;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormEnabled(false);

    const formData = new FormData(form.current ?? undefined);
    formData.append("voterId", voterId!);
    formData.append("subjectId", selectedSubject.toString());

    const body = Object.fromEntries(formData.entries());
    const response = await post("society/create", body);

    // const fileResponse = await postFile(
    //   `society/upload-society-picture/${response.newSociety}`,
    //   picture
    // );
    // if (!fileResponse.ok) {
    //   alert("Failed to upload file");
    // }

    await setStateBasedOnResponse(response);
    await fetchData();
    setModal(!modal);
    setFormEnabled(true);
  };

  const setStateBasedOnResponse = async response => {
    const responseMessage = (await response.json()).message;
    if (response.ok) {
      setSuccess(responseMessage);
      setError(null);
    } else {
      setSuccess(null);
      setError(responseMessage);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error("An error occurred:", error);
      }
    })();
  }, []);

  const toggleModal = () => {
    setModal(!modal);
  };

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modal]);

  return (
    <AuthenticatedRoute>
      <div className={styles.container}>
        <main>
          <div>
            <div className={styles.notification}>
              {success && (
                <InlineNotification
                  onClose={() => setSuccess(null)}
                  title={success}
                  kind="success"
                />
              )}
              {error && (
                <InlineNotification
                  onClose={() => setError(null)}
                  title={error}
                />
              )}
            </div>
            <div className={styles.content}>
              <div className={styles.header}>
                <h1>Societies</h1>
              </div>
              <div className={styles.create}>
                <Button
                  kind={"ghost"}
                  size={"md"}
                  className={styles.button}
                  renderIcon={Add}
                  onClick={() => {
                    toggleModal();
                  }}
                >
                  Create
                </Button>
              </div>
              <div className={styles.header}>
                <h2>View Societies by Subjects</h2>
              </div>
              <Search
                labelText={"Search for a society"}
                value={search}
                onChange={searchHandler}
                className={styles.search}
                placeholder={"Search for a society"}
              />
              <div className={styles.join}>
                <div className={styles.cardContainer}>
                  <div className={styles.outerContainer}>
                    {Object.keys(filteredSocieties)
                      .sort()
                      .map(subject => (
                        <div key={subject}>
                          <h2>{subject}</h2>
                          <div className={styles.cardContainer}>
                            {filteredSocieties[subject].map(society => (
                              <Cards
                                name={society.name}
                                key={society.societyId}
                                societySubject={society.societySubject}
                                profilePicture={society.societyPicture}
                              >
                                <Button
                                  onClick={() =>
                                    viewSocietyPageHandler(society.societyId)
                                  }
                                  renderIcon={PortInput}
                                >
                                  View Society
                                </Button>
                              </Cards>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ElectionModal modal={modal}>
            {modal && (
              <div>
                <h1 className={styles.modalHeader}>Create Society</h1>
                <form
                  aria-label="Create Society Form"
                  className={styles.form}
                  ref={form}
                  onSubmit={submit}
                >
                  <TextInput
                    id="name"
                    type="text"
                    labelText="Society Name"
                    name="name"
                    invalid={error !== null}
                  />
                  <ComboBox
                    className={styles.comboBox}
                    id={"subject"}
                    aria-label={"Select a subject"}
                    items={getSocietySubject.map(subject => subject.name)}
                    onChange={comboBoxHandler}
                    placeholder={"Select a subject"}
                  />
                  <TextArea
                    className={styles.textArea}
                    id="description"
                    labelText="Description"
                    name="description"
                    type="text"
                    invalid={error !== null}
                  />
                  {/*<FileUploader*/}
                  {/*  buttonLabel={"Upload a picture"}*/}
                  {/*  filenameStatus={"complete"}*/}
                  {/*  onChange={handleFileUpload}*/}
                  {/*  className={styles.fileUploader}*/}
                  {/*  accept={[".jpg", ".png", ".jpeg"]}*/}
                  {/*>*/}
                  {/*  Upload Profile Picture*/}
                  {/*</FileUploader>*/}
                  <div className={styles.submit}>
                    <Button
                      kind={"danger"}
                      renderIcon={Close}
                      onClick={toggleModal}
                      className={styles.button}
                    >
                      Cancel
                    </Button>
                    <Button
                      renderIcon={PortInput}
                      type="submit"
                      disabled={!formEnabled}
                      className={styles.button}
                    >
                      Create
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </ElectionModal>
        </main>
      </div>
    </AuthenticatedRoute>
  );
};
