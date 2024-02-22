import { useNavigate, useParams } from "react-router-dom";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { get, patch, post, postFile } from "../../utils/fetch";
import styles from "./style.module.scss";
import { AuthenticatedRoute } from "../../components/conditional-route";
import {
  Button,
  ComboBox,
  DatePicker,
  DatePickerInput,
  FileUploader,
  InlineNotification,
  NumberInput,
  SelectItem,
  TextArea,
  TextInput,
  TimePicker,
  TimePickerSelect,
} from "@carbon/react";
import { Close, Delete, Edit, PortInput, ResultNew } from "@carbon/icons-react";
import { ElectionModal } from "../../components/election-modal";
import { Routes } from "../index";
import { startOfDay } from "date-fns";

interface Society {
  name: string;
  description: string;
  SocietySubject: {
    subjectId: number;

    name: string;
  };
  picture?: string;
}

interface SocietySubject {
  subjectId: number;
  name: string;
}

export const SocietyPage = () => {
  const navigate = useNavigate();
  const sid = useParams<{ sid: string }>();
  const [societyData, setSocietyData] = useState<Society>({} as Society);
  const [getSocietySubject, setGetSocietySubject] = useState<SocietySubject[]>(
    []
  );
  const [selectedSubject, setSelectedSubject] = useState<number>(0);
  const [deleteSocieties, setDeleteSocieties] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [picture, setPicture] = useState(null);
  const [isSocietyOwner, setIsSocietyOwner] = useState<boolean | null>(null);
  const [isSocietyMember, setIsSocietyMember] = useState<boolean | null>(null);
  const [modal, setModal] = useState(false);
  const [modalContext, setModalContext] = useState<string | null>(null);
  const [kValue, setKValue] = useState<number>(2);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:00");
  const [startTimeZone, setStartTimeZone] = useState("GMT");
  const [endTimeZone, setEndTimeZone] = useState("GMT");

  const editSocietiesForm = useRef<HTMLFormElement>(null);
  const electionForm = useRef<HTMLFormElement>(null);
  const voterId = localStorage.getItem("USER_ID");

  const deleteNavigationHandler = () => {
    navigate(Routes.LANDING());
  };
  const handleFileUpload = event => {
    const file = event.target.files[0];
    setPicture(file);
  };

  const comboBoxHandler = event => {
    const subjectName = event.selectedItem;
    const subjectId = getSocietySubject.find(
      subject => subject.name === subjectName
    )?.subjectId;
    setSelectedSubject(subjectId!);
  };

  const kValueHandler = (event, newValue) => {
    setKValue(newValue.value);
  };
  const deleteSocietyHandler = async societyId => {
    setDeleteSocieties(societyId.sid);
  };

  const createElectionSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(electionForm.current ?? undefined);
    formData.append("voterId", voterId ?? "");
    formData.append("societyId", sid.sid!.toString() ?? "");
    formData.append("kValue", kValue.toString() ?? "");
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);
    formData.append("startTimeZone", startTimeZone);
    formData.append("endTimeZone", endTimeZone);

    const body = Object.fromEntries(formData.entries());
    const response = await post("election/create", body).then(res =>
      res.json()
    );

    const fileResponse = await postFile(
      `election/upload-election-picture/${response.newElection}`,
      picture
    );
    if (!fileResponse.ok) {
      alert("Failed to upload file");
    }

    await setStateBasedOnResponse(response);
    setModal(!modal);
  };

  const editSocietySubmit = async (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(editSocietiesForm.current ?? undefined);
    formData.append("societyId", sid.sid ?? "");
    formData.append("subjectId", selectedSubject.toString() ?? "");
    const body = Object.fromEntries(formData.entries());
    const response = await patch(`society/edit-society/${sid.sid}`, body);
    if (picture) {
      await uploadFile();
    }
    await fetchData();
    await setStateBasedOnResponse(response);
    setModal(false);
  };

  const deleteSociety = async () => {
    if (deleteSocieties !== null) {
      try {
        const response = await post(`society/delete/${deleteSocieties}`);
        await setStateBasedOnResponse(response);
        if (response.ok) {
          deleteNavigationHandler();
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await deleteSociety();
      } catch (error) {
        console.log(error);
      }
    })();
  }, [deleteSocieties]);

  const fetchData = async () => {
    try {
      const response = await get(`society/get-society-by-id/${sid.sid}`).then(
        res => res.json()
      );
      setSocietyData(response.society);
    } catch (error) {
      console.log(error);
    }

    try {
      const response = await get(`society/get-society-picture/${sid.sid}`).then(
        res => res.json()
      );
      setSocietyData(prev => ({ ...prev, picture: response.societyPicture }));
    } catch (error) {
      console.log(error);
    }
    try {
      const response = await get(
        `society/is-society-owner/${sid.sid}/${voterId}`
      );
      if (response.ok) {
        setIsSocietyOwner(true);
      }
    } catch (error) {
      console.log(error);
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

  const societyMember = async () => {
    try {
      const response = await get(`society/is-in-society/${sid.sid}/${voterId}`);
      if (response.ok) {
        setIsSocietyMember(false);
      } else {
        setIsSocietyMember(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await societyMember();
      } catch (error) {
        console.error(error);
      }
    })();
  }, [sid.sid]);

  const joinSociety = async (sid: string) => {
    try {
      const response = await post(`society/join/${sid}/${voterId}}`);
      await setStateBasedOnResponse(response);
      await societyMember();
    } catch (error) {
      console.error(error);
    }
  };
  const leaveSociety = async (sid: string) => {
    try {
      const response = await post(`society/leave/${sid}/${voterId}}`);
      await setStateBasedOnResponse(response);
      await societyMember();
    } catch (error) {
      console.error(error);
    }
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

  const uploadFile = async () => {
    const response = await postFile(
      `society/upload-society-picture/${sid.sid}`,
      picture
    );
    if (!response.ok) {
      alert("Failed to upload file");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error(error);
      }
    })();
  }, [sid.sid]);

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
        <div className={styles.notification}>
          {success && (
            <InlineNotification
              onClose={() => setSuccess(null)}
              title={success}
              kind="success"
            />
          )}
          {error && (
            <InlineNotification onClose={() => setError(null)} title={error} />
          )}
        </div>
        <div className={styles.mainContent}>
          {isSocietyOwner && (
            <div className={styles.ownerPanel}>
              <Button
                renderIcon={ResultNew}
                onClick={() => {
                  setModalContext("createElection");
                  setModal(!modal);
                }}
              >
                Create Election
              </Button>
              <Button
                renderIcon={Edit}
                kind={"ghost"}
                onClick={() => {
                  setModalContext("editSociety");
                  setModal(!modal);
                }}
                size={"sm"}
              >
                Edit Society
              </Button>
              <Button
                onClick={() => {
                  setModalContext("deleteSociety");
                  setModal(!modal);
                }}
                renderIcon={Delete}
                kind={"danger"}
              >
                Delete
              </Button>
            </div>
          )}

          <div className={styles.headerContent}>
            <img src={`/${societyData.picture}`} alt="" />
            <div className={styles.textContainer}>
              <h1>{societyData.name}</h1>
              <p>{societyData.SocietySubject?.name}</p>
            </div>
            <div className={styles.buttonContainer}>
              {isSocietyMember === true && (
                <Button
                  onClick={() => joinSociety(sid.sid ?? "")}
                  renderIcon={PortInput}
                >
                  Click to Join
                </Button>
              )}
              {isSocietyMember === false && (
                <Button
                  onClick={() => {
                    setModal(!modal);
                    setModalContext("leaveSociety");
                  }}
                  renderIcon={PortInput}
                  kind={"danger"}
                >
                  Click to Leave
                </Button>
              )}
            </div>
          </div>
          <div className={styles.middleContent}>
            <h2>About Us</h2>
            <p>{societyData.description}</p>
          </div>
          <div className={styles.bottomContainer}>
            <h2>Who's Involved</h2>
          </div>
        </div>
        <ElectionModal modal={modal}>
          {modalContext === "createElection" && (
            <form ref={electionForm} onSubmit={createElectionSubmit}>
              <h3>Create Election</h3>
              <TextInput
                id={"election_name"}
                labelText={"Election Name"}
                type={"text"}
                name={"name"}
                required={true}
              />
              <TextInput
                id={"description"}
                labelText={"Description"}
                type={"text"}
                name={"description"}
                required={true}
              />
              <NumberInput
                id={"kValue"}
                label={"K-anonymity value"}
                size={"lg"}
                min={1}
                max={10}
                defaultValue={2}
                required={true}
                onChange={kValueHandler}
              />
              <div className={styles.datePicker}>
                <DatePicker
                  datePickerType="range"
                  onChange={event => {
                    setStartDate(event[0].toISOString().split("T")[0]);
                    setEndDate(event[1].toISOString().split("T")[0]);
                  }}
                  minDate={startOfDay(new Date()).toISOString()}
                >
                  <DatePickerInput
                    id="date-picker-input-id-start"
                    placeholder="mm/dd/yyyy"
                    labelText="Start date"
                  />
                  <DatePickerInput
                    id="date-picker-input-id-finish"
                    placeholder="mm/dd/yyyy"
                    labelText="End date"
                  />
                </DatePicker>
              </div>
              <TimePicker
                onChange={event => {
                  setStartTime(event.target.value);
                }}
                defaultValue={"12:00"}
                id="time-picker"
                labelText="Select a start time"
                pattern={"[0-9]{2}:[0-9]{2}"}
              >
                <TimePickerSelect
                  id="time-picker-select-2"
                  defaultValue="UTC"
                  onChange={event => setStartTimeZone(event.target.value)}
                >
                  <SelectItem value="BST" text="BST" />
                  <SelectItem value="UTC" text="UTC" />
                </TimePickerSelect>
              </TimePicker>
              <TimePicker
                id="time-picker"
                labelText="Select a finish time"
                defaultValue={"12:00"}
                pattern={"[0-9]{2}:[0-9]{2}"}
                onChange={event => {
                  setEndTime(event.target.value);
                }}
              >
                <TimePickerSelect
                  id="time-picker-select-2"
                  defaultValue="UTC"
                  onChange={event => {
                    setEndTimeZone(event.target.value);
                  }}
                >
                  <SelectItem value="BST" text="BST" />
                  <SelectItem value="UTC" text="UTC" />
                </TimePickerSelect>
              </TimePicker>
              <FileUploader
                buttonLabel={"Upload a picture"}
                filenameStatus={"complete"}
                onChange={handleFileUpload}
                className={styles.fileUploader}
                accept={[".jpg", ".png", ".jpeg"]}
              >
                Upload Profile Picture
              </FileUploader>
              <Button
                onClick={() => setModal(!modal)}
                renderIcon={Close}
                kind={"danger"}
              >
                Cancel
              </Button>
              <Button renderIcon={PortInput} kind={"primary"} type={"submit"}>
                Create
              </Button>
            </form>
          )}
          {modalContext === "editSociety" && (
            <div className={styles.modal}>
              <form
                aria-label={"Edit Society Form"}
                ref={editSocietiesForm}
                onSubmit={editSocietySubmit}
              >
                <h3>Editing society</h3>
                <TextInput
                  id={"societyName"}
                  labelText={"Society Name"}
                  type={"text"}
                  name={"name"}
                  defaultValue={societyData.name}
                />
                <ComboBox
                  className={styles.comboBox}
                  id={"subject"}
                  aria-label={"Select a subject"}
                  items={getSocietySubject.map(subject => subject.name)}
                  onChange={comboBoxHandler}
                  placeholder={"Select a subject"}
                  defaultValue={societyData.SocietySubject.subjectId}
                />
                <TextArea
                  className={styles.textArea}
                  id={"societyDescription"}
                  labelText={"Society Description"}
                  type={"text"}
                  name={"description"}
                  defaultValue={societyData.description}
                />
                <FileUploader
                  buttonLabel={"Upload a picture"}
                  filenameStatus={"complete"}
                  onChange={handleFileUpload}
                  className={styles.fileUploader}
                  accept={[".jpg", ".png", ".jpeg"]}
                >
                  Upload Profile Picture
                </FileUploader>
                <p>JPG, PNG, JPEG files only</p>
                <Button
                  renderIcon={Close}
                  kind={"danger"}
                  onClick={() => setModal(!modal)}
                >
                  Close
                </Button>
                <Button type={"submit"} renderIcon={PortInput} kind={"primary"}>
                  Confirm
                </Button>
              </form>
            </div>
          )}
          {modalContext === "deleteSociety" && (
            <div>
              <p>
                Are you sure you want to delete this society? This action is
                irreversible. All candidates will be removed and all elections
                will be deleted.
              </p>
              <Button renderIcon={Close} onClick={() => setModal(!modal)}>
                Close
              </Button>
              <Button
                renderIcon={PortInput}
                kind={"danger"}
                onClick={() => deleteSocietyHandler(sid)}
              >
                Confirm
              </Button>
            </div>
          )}
          {modalContext === "leaveSociety" && (
            <div>
              <p>
                You are about to leave this society. You can join back at any
                time from the society's page.
              </p>
              <Button renderIcon={Close} onClick={() => setModal(!modal)}>
                Close
              </Button>
              <Button
                renderIcon={PortInput}
                kind={"danger"}
                onClick={() => {
                  setModal(!modal);
                  leaveSociety(sid.sid ?? "");
                }}
              >
                Confirm
              </Button>
            </div>
          )}
        </ElectionModal>
      </div>
    </AuthenticatedRoute>
  );
};
