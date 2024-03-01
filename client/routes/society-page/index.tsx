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
import {
  Add,
  Close,
  Save,
  Edit,
  PortInput,
  ResultNew,
  View,
  Exit,
  Upload,
  FaceAdd,
  TrashCan,
} from "@carbon/icons-react";
import { ElectionModal } from "../../components/election-modal";
import { Routes } from "../index";
import { Cards } from "../../components/cards";
import { TabComponent } from "../../components/tabs";
import { ElectionModalCards } from "../../components/modal-cards";
import { VoteModalCards } from "../../components/vote-modal";
import { LiveVotes } from "../../components/live-votes";
import { parseISO, format, startOfDay } from "date-fns";

interface Society {
  society: {
    name: string;
    description: string;
    SocietySubject: {
      subjectId: number;

      name: string;
    };
  };
  picture?: string;
  totalMembers: number;
  totalElections: number;
  totalTeamMembers: number;
}

interface SocietySubject {
  subjectId: number;
  name: string;
}

interface Elections {
  electionId: number;
  name: string;
  societyId: number;
  description: string;
  start: string;
  end: string;

  ElectionPicture?: { path: string };
}

interface Winner {
  candidateId: number;
  candidateName: string;
  candidateAlias: string;
  votes?: number;
}
interface electionCandidates {
  candidateId: number;
  candidateName: string;
  candidateAlias: string;
  description: string;
}

interface SocietyMembers {
  memberId: number;
  name: string;
  alias: string;
  role: string;
  MemberPicture: { path: string };
}

interface Results {
  candidateId: number;
  totalVotes: number;

  candidateName: string;
  candidateAlias: string;
  description?: string;
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
  const [deleteMember, setDeleteMember] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [picture, setPicture] = useState(null);
  const [memberPicture, setMemberPicture] = useState(null);
  const [candidatePicture, setCandidatePicture] = useState(null);
  const [isSocietyOwner, setIsSocietyOwner] = useState<boolean>(false);
  const [isSocietyMember, setIsSocietyMember] = useState<boolean | null>(null);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [isMembers, setIsMembers] = useState(false);
  const [modalContent, setModalContent] = useState<string | null>(null);
  // const [modalContext, setModalContext] = useState<string | null>(null);
  const [getFinishedResults, setGetFinishedResults] = useState<Winner>();
  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const [selectedElectionCandidate, setSelectedElectionCandidate] = useState<
    number | null
  >(null);
  const [getFinishedElections, setGetFinishedElections] = useState<
    Elections[] | null
  >([]);
  const [getClosedElections, setGetClosedElections] = useState<
    Elections[] | null
  >([]);
  const [getElectionCandidates, setGetElectionCandidates] = useState<
    electionCandidates[] | null
  >([]);
  const [societyTeamMember, setSocietyTeamMember] = useState<
    SocietyMembers[] | null
  >([]);
  const [getOpenElections, setGetOpenElections] = useState<Elections[] | null>(
    []
  );
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null
  );
  const [getResults, setGetResults] = useState<Results[] | null>([]);

  const editSocietiesForm = useRef<HTMLFormElement>(null);
  const createMemberForm = useRef<HTMLFormElement>(null);
  const editMemberForm = useRef<HTMLFormElement>(null);
  const electionForm = useRef<HTMLFormElement>(null);
  const candidateForm = useRef<HTMLFormElement>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:00");
  const [startTimeZone, setStartTimeZone] = useState("GMT");
  const [endTimeZone, setEndTimeZone] = useState("GMT");
  const [kValue, setKValue] = useState<number>(2);
  const voterId = localStorage.getItem("USER_ID");

  const navigateEditHandler = () => {
    navigate(Routes.EDIT_SOCIETY(sid.sid));
  };
  const navigateCreateElectionHandler = () => {
    navigate(Routes.CREATE_ELECTION(sid.sid));
  };

  const deleteNavigationHandler = () => {
    navigate(Routes.LANDING());
  };

  const comboBoxHandler = event => {
    const subjectName = event.selectedItem;
    const subjectId = getSocietySubject.find(
      subject => subject.name === subjectName
    )?.subjectId;
    setSelectedSubject(subjectId!);
  };

  const viewCandidateHandler = async (electionId: number | null) => {
    setSelectedElection(electionId);
    console.log(`Selected electionID ${selectedElection}`);
  };

  const voteHandler = (candidateId: number) => {
    setSelectedCandidate(candidateId);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = event => {
    const file = event.target.files[0];
    setPicture(file);
  };
  const handleMemberFileChange = event => {
    const file = event.target.files[0];
    setMemberPicture(file);
  };
  const handleCandidateFileChange = event => {
    const file = event.target.files[0];
    console.log(file);
    setCandidatePicture(file);
    console.log(candidatePicture);
  };

  const createMemberSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(createMemberForm.current ?? undefined);
    formData.append("societyId", sid.sid ?? "");
    const body = Object.fromEntries(formData.entries());

    const response = await post(
      `society/create-society-member/${sid.sid}`,
      body
    );
    const responseJson = await response.json();
    const responseMember = responseJson.member;

    if (response.ok) {
      setSuccess(responseJson.message);
      setError(null);
    } else {
      setSuccess(null);
      setError(responseJson.message);
    }
    if (memberPicture !== null) {
      const fileResponse = await postFile(
        `society/upload-society-member-picture/${responseMember}`,
        memberPicture
      );
      if (fileResponse.ok) {
        await setStateBasedOnResponse(fileResponse);
        setPicture(null);
      } else {
        alert("Failed to upload file");
      }
    }
    toggleModal();
    await fetchData();
  };

  const addElectionCandidateSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const formData = new FormData(candidateForm.current ?? undefined);

    const body = Object.fromEntries(formData.entries());

    const response = await post(
      `election/${selectedElectionCandidate}/add-candidate`,
      body
    );

    const responseData = await response.json();
    console.log(responseData.message);

    if (candidatePicture !== null) {
      const fileResponse = await postFile(
        `election/upload-election-candidate-picture/${responseData.candidate}`,
        candidatePicture
      );
    }

    await setStateBasedOnResponse(response);
    setSelectedElection(null);
    await fetchData();
    setModal(!modal);
  };

  const createElectionSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(electionForm.current ?? undefined);
    formData.append("voterId", voterId ?? "");
    formData.append("societyId", sid.sid ?? "");
    formData.append("kValue", kValue.toString() ?? "");
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);
    formData.append("startTimeZone", startTimeZone);
    formData.append("endTimeZone", endTimeZone);

    const body = Object.fromEntries(formData.entries());
    const response = await post("election/create", body);
    const responseMessage = (await response.json()).message;

    if (picture !== null) {
      const fileResponse = await postFile(
        `election/upload-election-picture/${responseMessage.newElection}`,
        picture
      );
    }

    if (response.ok) {
      setSuccess(responseMessage);
      setError(null);
      setModal(!modal);
      fetchData();
    } else {
      setSuccess(null);
      setError(responseMessage);
    }
  };

  const editSocietySubmit = async (event: FormEvent) => {
    event.preventDefault();
    console.log("EDIT SOCIETIES FORM SUBMITTED");
    console.log(societyData.society.SocietySubject.subjectId);
    const formData = new FormData(editSocietiesForm.current ?? undefined);
    formData.append("societyId", sid.sid ?? "");
    formData.append("subjectId", selectedSubject.toString() ?? "");
    const body = Object.fromEntries(formData.entries());
    const response = await patch(`society/edit-society/${sid.sid}`, body);
    await fetchData();
    toggleIsEdit();
    await setStateBasedOnResponse(response);
  };

  const editMemberSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(editMemberForm.current ?? undefined);
    const body = Object.fromEntries(formData.entries());
    const response = await patch(
      `society/edit-society-member/${editingMemberId}`,
      body
    );
    await fetchData();
    await setStateBasedOnResponse(response);
    setEditingMemberId(null);
  };

  const deleteTeamMember = async () => {
    if (deleteMember !== null) {
      try {
        const response = await post(
          `society/delete-society-member/${deleteMember}`
        );
        await setStateBasedOnResponse(response);
        await fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await deleteTeamMember();
      } catch (error) {
        console.log(error);
      }
    })();
  }, [deleteMember]);
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
      const response = await get(`vote/get-open-elections/${sid.sid}`).then(
        res => res.json()
      );
      const sortedElections = response.openElections
        .map(openElections => openElections.Elections)
        .flat()
        .sort((a, b) => a.name.localeCompare(b.name));
      setGetOpenElections(sortedElections);
    } catch (error) {
      console.log(`Error when retrieving open election data: ${error}`);
    }
    if (selectedElection != null) {
      try {
        const response = await get(`vote/results/${selectedElection}`).then(
          res => res.json()
        );
        setGetResults(response);
      } catch (error) {
        console.log(error);
      }
    }

    try {
      const response = await get(`vote/get-closed-elections/${sid.sid}`).then(
        res => res.json()
      );
      const sortedElections = response.closedElections
        .map(closedElections => closedElections.Elections)
        .flat()
        .sort((a, b) => a.name.localeCompare(b.name));
      setGetClosedElections(sortedElections);
    } catch (error) {
      console.log(`Error when retrieving open election data: ${error}`);
    }

    if (selectedElection != null) {
      try {
        const response = await get(
          `election/getElectionCandidates/${selectedElection}`
        ).then(res => res.json());

        if (response.ElectionCandidates.length === 0) {
          setSelectedElection(null);
          setError("No candidates found for this election, check back later.");
        } else {
          setGetElectionCandidates(response.ElectionCandidates);
          toggleModal();
        }

        setGetElectionCandidates(response.ElectionCandidates);
      } catch (error) {
        console.log(error);
      }
    }
    try {
      const response = await get(`society/get-society-by-id/${sid.sid}`).then(
        res => res.json()
      );
      setSocietyData(response.response);
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

    try {
      const response = await get(`vote/get-finished-elections/${sid.sid}`).then(
        res => res.json()
      );
      setGetFinishedElections(response.elections);
    } catch (error) {
      console.log(error);
    }

    if (selectedElection != null) {
      try {
        const response = await get(`election/winner/${selectedElection}`).then(
          res => res.json()
        );
        setGetFinishedResults(response.winner);
      } catch (error) {
        console.log(error);
      }
    }

    try {
      const response = await get(`society/get-society-members/${sid.sid}`).then(
        res => res.json()
      );
      setSocietyTeamMember(response.members);
    } catch (error) {
      console.log(error);
    }
  };

  const vote = async () => {
    if (selectedCandidate !== null) {
      try {
        const response = await post(
          `vote/election/${selectedElection}/voter/${voterId}/candidate/${selectedCandidate}`
        );
        if (response.ok) {
          setError(
            "Dont worry if you cant see your vote, we're utilising k-anonymity to ensure your vote is kept private."
          );
        }
        await setStateBasedOnResponse(response);
        setSelectedCandidate(null);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await vote();
      } catch (error) {
        console.error("An error occurred:", error);
      }
    })();
  }, [selectedCandidate, selectedElection, voterId]);

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
      await fetchData();
    } catch (error) {
      console.error(error);
    }
  };
  const leaveSociety = async (sid: string) => {
    try {
      const response = await post(`society/leave/${sid}/${voterId}}`);
      await setStateBasedOnResponse(response);
      await societyMember();
      await fetchData();
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

  const uploadMemberFile = async () => {
    const response = await postFile(
      `society/upload-society-member-picture/${editingMemberId}`,
      memberPicture
    );
    if (response.ok) {
      setMemberPicture(null);
      await fetchData();
      await setStateBasedOnResponse(response);
    } else {
      alert("Failed to upload file");
    }
  };

  useEffect(() => {
    if (memberPicture) {
      try {
        uploadMemberFile();
      } catch (error) {
        console.log(error);
      }
    }
  }, [memberPicture]);

  const uploadFile = async () => {
    const response = await postFile(
      `society/upload-society-picture/${sid.sid}`,
      picture
    );
    if (response.ok) {
      toggleIsEdit();
      await fetchData();
      await setStateBasedOnResponse(response);
      setPicture(null);
    } else {
      alert("Failed to upload file");
    }
  };

  const handleFileUpload = event => {
    const file = event.target.files[0];
    setPicture(file);
  };

  const kValueHandler = (event, newValue) => {
    setKValue(newValue.value);
  };

  useEffect(() => {
    if (picture) {
      try {
        uploadFile();
      } catch (error) {
        console.log(error);
      }
    }
  }, [picture]);

  useEffect(() => {
    (async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error(error);
      }
    })();
  }, [sid.sid, voterId, selectedElection]);

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

  const toggleModal = () => {
    setModal(!modal);
  };

  const toggleIsEdit = () => {
    setIsEdit(!isEdit);
  };
  const toggleIsMembers = () => {
    setIsMembers(!isMembers);
  };

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
        <div className={styles.header}>
          <div className={styles.societyPic}>
            {isSocietyOwner && isEdit && (
              <div className={styles.societyPicButton}>
                <Button
                  size={"lg"}
                  kind={"secondary"}
                  renderIcon={Upload}
                  onClick={() => openFileUpload()}
                  hasIconOnly={true}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept={"image/*"}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            )}
            <img src={`/${societyData.picture}`} alt="" />
          </div>
          <div className={styles.societyInfo}>
            <section className={styles.sectionContainer}>
              <form onSubmit={editSocietySubmit} ref={editSocietiesForm}>
                <div className={styles.sectionOne}>
                  {isSocietyOwner && !isEdit && (
                    <h2>{societyData.society.name}</h2>
                  )}
                  {isSocietyOwner && isEdit && (
                    <TextInput
                      id={"societyName"}
                      labelText={"Society Name"}
                      type={"text"}
                      name={"name"}
                      defaultValue={societyData.society.name}
                    />
                  )}
                  <div className={styles.sectionOneButton}>
                    {isSocietyOwner && !isEdit && (
                      <Button
                        size={"sm"}
                        kind={"primary"}
                        renderIcon={ResultNew}
                        onClick={() => {
                          setModalContent("createElection");
                          toggleModal();
                        }}
                        hasIconOnly={true}
                      />
                    )}
                    {isSocietyOwner && !isEdit && (
                      <Button
                        size={"sm"}
                        kind={"tertiary"}
                        renderIcon={FaceAdd}
                        onClick={() => {
                          toggleModal();
                          setModalContent("teamMembers");
                        }}
                        hasIconOnly={true}
                      />
                    )}
                    {isSocietyOwner && isEdit && (
                      <Button
                        size={"sm"}
                        kind={"ghost"}
                        renderIcon={Save}
                        type={"submit"}
                        hasIconOnly={true}
                      />
                    )}
                    {isSocietyOwner && (
                      <Button
                        size={"sm"}
                        kind={"ghost"}
                        renderIcon={Edit}
                        onClick={() => {
                          toggleIsEdit();
                          setEditingMemberId(null);
                        }}
                        hasIconOnly={true}
                      />
                    )}
                    {isSocietyMember && !isEdit && (
                      <Button
                        size={"sm"}
                        kind={"ghost"}
                        renderIcon={Add}
                        onClick={() => joinSociety(sid.sid ?? "")}
                      >
                        Join
                      </Button>
                    )}
                    {!isSocietyMember && !isEdit && (
                      <Button
                        size={"sm"}
                        kind={"danger--ghost"}
                        renderIcon={Exit}
                        onClick={() => leaveSociety(sid.sid ?? "")}
                      >
                        Leave
                      </Button>
                    )}
                  </div>
                </div>
                <div className={styles.sectionTwo}>
                  <ul className={styles.sectionTwoContent}>
                    <li className={styles.sectionTwoContentItems}>
                      {societyData.totalElections} elections
                    </li>
                    <li className={styles.sectionTwoContentItems}>
                      {societyData.totalMembers} members
                    </li>
                    <li className={styles.sectionTwoContentItems}>
                      {societyData.totalTeamMembers} team members
                    </li>
                  </ul>
                </div>
                <div className={styles.sectionThree}>
                  {isSocietyOwner && isEdit && (
                    <div>
                      <ComboBox
                        className={styles.comboBox}
                        id={"subject"}
                        aria-label={"Select a subject"}
                        items={getSocietySubject.map(subject => subject.name)}
                        onChange={comboBoxHandler}
                        placeholder={societyData.society.SocietySubject.name}
                        defaultValue={
                          societyData.society.SocietySubject.subjectId
                        }
                        required
                      />
                      <TextArea
                        id={"societyDescription"}
                        type={"text"}
                        name={"description"}
                        labelText={"Society description"}
                        defaultValue={societyData.society.description}
                      />
                    </div>
                  )}
                  {isSocietyOwner && !isEdit && (
                    <div className={styles.sectionThree}>
                      <span>{societyData.society.SocietySubject?.name}</span>
                      <br />
                      <span>{societyData.society.description}</span>
                    </div>
                  )}
                </div>
              </form>
            </section>
          </div>
        </div>
        <div className={styles.whoIsInvolved}>
          <h2>Who's involved</h2>
          <div className={styles.teamContainer}>
            {societyTeamMember &&
              societyTeamMember.map(member => (
                <div className={styles.teamMember} key={member.memberId}>
                  {isSocietyOwner && (
                    <div className={styles.teamMemberButton}>
                      <Button
                        size={"sm"}
                        kind={"ghost"}
                        renderIcon={Edit}
                        onClick={() => setEditingMemberId(member.memberId)}
                        hasIconOnly={true}
                      />
                    </div>
                  )}
                  {editingMemberId === member.memberId ? (
                    <div className={styles.teamMemberEdit}>
                      <div className={styles.editMemberPicContainer}>
                        <img
                          src={
                            member.MemberPicture?.path
                              ? `/${member.MemberPicture?.path}`
                              : "/client/assets/defaultMemberImage.jpeg"
                          }
                          alt={member.name}
                        />
                        <div className={styles.editMemberPicButton}>
                          <Button
                            kind={"secondary"}
                            renderIcon={Upload}
                            onClick={() => openFileUpload()}
                            hasIconOnly={true}
                          />
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept={"image/*"}
                            onChange={handleMemberFileChange}
                            style={{ display: "none" }}
                          />
                        </div>
                      </div>{" "}
                      <form onSubmit={editMemberSubmit} ref={editMemberForm}>
                        <TextInput
                          id={"societyRole"}
                          labelText={"Member Role"}
                          type={"text"}
                          name={"role"}
                          defaultValue={member.role}
                        />
                        <TextInput
                          id={"memberName"}
                          labelText={"Member Name"}
                          type={"text"}
                          name={"name"}
                          defaultValue={member.name}
                        />
                        <TextInput
                          id={"societyAlias"}
                          labelText={"Society Alias"}
                          type={"text"}
                          name={"alias"}
                          defaultValue={member.alias}
                        />
                        <div>
                          <Button
                            size={"sm"}
                            kind={"danger--tertiary"}
                            renderIcon={TrashCan}
                            onClick={() => setDeleteMember(member.memberId)}
                            hasIconOnly={true}
                          />
                          <Button
                            type={"submit"}
                            size={"sm"}
                            kind={"ghost"}
                            renderIcon={Save}
                            hasIconOnly={true}
                          />
                        </div>
                      </form>
                    </div>
                  ) : (
                    <>
                      <img
                        src={
                          member.MemberPicture?.path
                            ? `/${member.MemberPicture?.path}`
                            : "/client/assets/defaultMemberImage.jpeg"
                        }
                        alt={member.name}
                      />
                      <h5>{member.role}</h5>
                      <h6>{member.name}</h6>
                      <span>{member.alias}</span>
                    </>
                  )}
                </div>
              ))}
          </div>
          {modalContent === "createElection" && (
            <ElectionModal modal={modal}>
              <div>
                <div className={styles.container}>
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
                      renderIcon={Close}
                      kind={"danger"}
                      onClick={() => {
                        toggleModal();
                        setModalContent(null);
                      }}
                    >
                      Close
                    </Button>
                    <Button
                      renderIcon={PortInput}
                      kind={"primary"}
                      type={"submit"}
                    >
                      Create
                    </Button>
                  </form>
                </div>
              </div>
            </ElectionModal>
          )}
          {modalContent === "teamMembers" && (
            <ElectionModal modal={modal}>
              <div>
                <form onSubmit={createMemberSubmit} ref={createMemberForm}>
                  <h6>Add a team member</h6>
                  <div className={styles.memberPicture}>
                    <Button
                      size={"lg"}
                      kind={"tertiary"}
                      renderIcon={Add}
                      hasIconOnly={true}
                      onClick={() => openFileUpload()}
                    />
                    <span
                      style={{ backgroundImage: `url(${memberPicture})` }}
                    ></span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept={"image/*"}
                      onChange={handleMemberFileChange}
                      style={{ display: "none" }}
                    />
                    <img src="" alt="" />
                  </div>
                  <div className={styles.memberInfo}>
                    <TextInput
                      id={"memberName"}
                      labelText={"Name"}
                      type={"text"}
                      name={"name"}
                    />
                    <TextInput
                      id={"alias"}
                      labelText={"Alias"}
                      type={"text"}
                      name={"alias"}
                    />
                    <TextInput
                      id={"role"}
                      labelText={"Role"}
                      type={"text"}
                      name={"role"}
                    />
                    <div className={styles.createMemberButtons}>
                      <Button
                        size={"md"}
                        kind={"danger"}
                        renderIcon={Close}
                        onClick={() => toggleModal()}
                        type={"submit"}
                        hasIconOnly={true}
                      />
                      <Button
                        size={"md"}
                        kind={"primary"}
                        renderIcon={Save}
                        type={"submit"}
                        hasIconOnly={true}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </ElectionModal>
          )}
        </div>
        <div className={styles.elections}>
          <TabComponent
            tabListNames={[
              {
                name: "Current Elections",
              },
              {
                name: "Upcoming Elections",
              },
              {
                name: "Past Elections",
              },
            ]}
            tabContents={[
              <>
                <div className={styles.cardContainer}>
                  {getOpenElections &&
                    getOpenElections.map(elections => (
                      <Cards
                        name={elections.name}
                        key={elections.electionId}
                        description={elections.description}
                        profilePicture={elections.ElectionPicture?.path}
                      >
                        <br />
                        <p>
                          This election ends: {""}
                          {format(parseISO(elections.end), "PPPP, p")}
                        </p>
                        <Button
                          renderIcon={View}
                          onClick={() => {
                            viewCandidateHandler(elections.electionId);
                            setModalContent("vote");
                          }}
                        >
                          View Candidates
                        </Button>
                      </Cards>
                    ))}
                  {modalContent === "vote" && (
                    <VoteModalCards modal={modal}>
                      <div className={styles.cardContainer}>
                        {getResults &&
                          getResults.map(results => (
                            <Cards
                              name={results.candidateName}
                              key={results.candidateId}
                              description={results.description}
                              alias={results.candidateAlias}
                            >
                              <Button
                                renderIcon={PortInput}
                                onClick={() => voteHandler(results.candidateId)}
                              >
                                Vote
                              </Button>
                              <div className={styles.resultsContainer}>
                                <LiveVotes>
                                  <p>Total Votes: {results?.totalVotes}</p>
                                </LiveVotes>
                              </div>
                            </Cards>
                          ))}
                      </div>
                      <Button
                        onClick={() => {
                          toggleModal();
                          setModalContent(null);
                          setSelectedElection(null);
                        }}
                        renderIcon={Close}
                        kind={"danger"}
                      >
                        Close
                      </Button>
                    </VoteModalCards>
                  )}
                </div>
              </>,
              <>
                <div className={styles.cardContainer}>
                  {getClosedElections &&
                    getClosedElections.map(elections => (
                      <Cards
                        name={elections.name}
                        key={elections.electionId}
                        description={elections.description}
                        profilePicture={elections.ElectionPicture?.path}
                      >
                        <br />
                        <p>
                          This election start: {""}
                          {format(parseISO(elections?.start), "PPPP, p")}
                        </p>
                        <br />
                        <p>
                          This election ends: {""}
                          {format(parseISO(elections?.end), "PPPP, p")}
                        </p>
                        <Button
                          renderIcon={View}
                          onClick={() => {
                            viewCandidateHandler(elections.electionId);
                            setModalContent("electionModalCards");
                          }}
                        >
                          View Candidates
                        </Button>
                        {isSocietyOwner && (
                          <Button
                            renderIcon={Add}
                            kind={"ghost"}
                            onClick={() => {
                              setModalContent("addCandidates");
                              toggleModal();
                              setSelectedElectionCandidate(
                                elections.electionId
                              );
                            }}
                          >
                            Add Candidates
                          </Button>
                        )}
                      </Cards>
                    ))}
                  {modalContent === "addCandidates" && (
                    <ElectionModal modal={modal}>
                      <h3>Add candidate to election</h3>
                      <form
                        ref={candidateForm}
                        onSubmit={addElectionCandidateSubmit}
                      >
                        <div className={styles.addCandidateContainer}>
                          <TextInput
                            id={"candidateName"}
                            labelText={"Candidate Name"}
                            type={"text"}
                            name={"candidateName"}
                            required={true}
                          />
                          <TextInput
                            id={"candidateName"}
                            labelText={"Alias"}
                            type={"text"}
                            name={"candidateAlias"}
                            required={true}
                          />
                          <TextInput
                            id={"Description"}
                            labelText={"Description"}
                            type={"text"}
                            name={"description"}
                            required={true}
                          />
                          <FileUploader
                            buttonLabel={"Upload a picture"}
                            filenameStatus={"complete"}
                            onChange={handleCandidateFileChange}
                            className={styles.fileUploader}
                            accept={[".jpg", ".png", ".jpeg"]}
                          >
                            Upload Profile Picture
                          </FileUploader>
                        </div>
                        <Button
                          onClick={() => {
                            toggleModal();
                            setModalContent(null);
                          }}
                          renderIcon={Close}
                          kind={"danger"}
                        >
                          Cancel
                        </Button>
                        <Button
                          renderIcon={PortInput}
                          kind={"primary"}
                          type={"submit"}
                        >
                          Add
                        </Button>
                      </form>
                    </ElectionModal>
                  )}
                  <ElectionModalCards
                    modal={modal}
                    modalContents={modalContent}
                    cardContents={getElectionCandidates}
                  >
                    <Button
                      onClick={() => {
                        toggleModal();
                        setSelectedElection(null);
                      }}
                      renderIcon={Close}
                      kind={"danger"}
                    >
                      Close
                    </Button>
                  </ElectionModalCards>
                </div>
              </>,
              <>
                <div className={styles.cardContainer}>
                  {getFinishedElections &&
                    getFinishedElections.map(elections => (
                      <div className={styles.cardContent}>
                        <Cards
                          name={elections.name}
                          key={elections.electionId}
                          description={elections.description}
                          profilePicture={elections.ElectionPicture?.path}
                        >
                          <br />
                          <p>
                            This election ended: {""}
                            {format(parseISO(elections?.end), "PPPP, p")}
                          </p>
                          <Button
                            renderIcon={View}
                            onClick={() =>
                              viewCandidateHandler(elections.electionId)
                            }
                          >
                            View Winner
                          </Button>
                        </Cards>
                      </div>
                    ))}
                  {modalContent === "winner" && (
                    <ElectionModal modal={modal}>
                      <h2>Winner</h2>
                      {getFinishedResults && (
                        <Cards
                          name={getFinishedResults.candidateName}
                          key={getFinishedResults.candidateId}
                          description={getFinishedResults.candidateAlias}
                        >
                          {""}
                        </Cards>
                      )}
                      <Button
                        renderIcon={Close}
                        onClick={() => {
                          toggleModal();
                          setSelectedElection(null);
                          setModalContent(null);
                        }}
                        kind={"danger"}
                      >
                        Close
                      </Button>
                    </ElectionModal>
                  )}
                </div>
              </>,
            ]}
          />
        </div>
        <div className={styles.relatedSocieties}></div>
      </div>
    </AuthenticatedRoute>
  );
};
