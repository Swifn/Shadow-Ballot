import { AuthenticatedRoute } from "../../components/conditional-route";
import styles from "./style.module.scss";
import React, { FormEvent, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import {
  Button,
  DatePicker,
  DatePickerInput,
  FileUploader,
  InlineNotification,
  NumberInput,
  SelectItem,
  TextInput,
  TimePicker,
  TimePickerSelect,
} from "@carbon/react";
import { PortInput } from "@carbon/icons-react";
import { post, postFile } from "../../utils/fetch";
import { format, parseISO, startOfDay } from "date-fns";

export const CreateElection = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:00");
  const [startTimeZone, setStartTimeZone] = useState("GMT");
  const [endTimeZone, setEndTimeZone] = useState("GMT");
  const [picture, setPicture] = useState(null);
  const [kValue, setKValue] = useState<number>(2);
  const electionForm = useRef<HTMLFormElement>(null);
  const societyId = useParams<{ sid: string }>();
  const voterId = localStorage.getItem("USER_ID");

  const createElectionSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(electionForm.current ?? undefined);
    formData.append("voterId", voterId ?? "");
    formData.append("societyId", societyId.sid!.toString() ?? "");
    formData.append("kValue", kValue.toString() ?? "");
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);
    formData.append("startTimeZone", startTimeZone);
    formData.append("endTimeZone", endTimeZone);

    const body = Object.fromEntries(formData.entries());
    const response = await post("election/create", body);
    console.log(response);
    const responseMessage = (await response.json()).message;

    if (picture !== null) {
      const fileResponse = await postFile(
        `election/upload-election-picture/${responseMessage.newElection}`,
        picture
      );
      if (!fileResponse.ok) {
        alert("Failed to upload file");
      }
    }
    if (response.ok) {
      setSuccess(responseMessage);
      setError(null);
      setModal(!modal);
    } else {
      setSuccess(null);
      setError(responseMessage);
    }
  };

  const handleFileUpload = event => {
    const file = event.target.files[0];
    setPicture(file);
  };

  const kValueHandler = (event, newValue) => {
    setKValue(newValue.value);
  };

  return (
    <AuthenticatedRoute>
      <div>
        <div>
          <Helmet>Edit Society</Helmet>
        </div>
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
            <Button renderIcon={PortInput} kind={"primary"} type={"submit"}>
              Create
            </Button>
          </form>
        </div>
      </div>
    </AuthenticatedRoute>
  );
};
