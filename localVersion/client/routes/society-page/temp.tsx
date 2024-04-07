// <div className={styles.container}>
//   <div className={styles.notification}>
//     {success && (
//       <InlineNotification
//         onClose={() => setSuccess(null)}
//         title={success}
//         kind="success"
//       />
//     )}
//     {error && (
//       <InlineNotification onClose={() => setError(null)} title={error} />
//     )}
//   </div>
//   <div className={styles.mainContent}>
//     {isSocietyOwner && (
//       <div className={styles.ownerPanel}>
//         <Button
//           renderIcon={ResultNew}
//           onClick={() => {
//             setModalContext("createElection");
//             setModal(!modal);
//           }}
//         >
//           Create Election
//         </Button>
//         <Button
//           renderIcon={Edit}
//           kind={"ghost"}
//           onClick={() => {
//             setModalContext("editSociety");
//             setModal(!modal);
//           }}
//           size={"sm"}
//         >
//           Edit Society
//         </Button>
//         <Button
//           onClick={() => {
//             setModalContext("deleteSociety");
//             setModal(!modal);
//           }}
//           renderIcon={Delete}
//           kind={"danger"}
//         >
//           Delete
//         </Button>
//       </div>
//     )}
//
//     <div className={styles.headerContent}>
//       <img src={`/${societyData.picture}`} alt="" />
//       <div className={styles.textContainer}>
//         <h1>{societyData.name}</h1>
//         <p>{societyData.SocietySubject?.name}</p>
//       </div>
//       <div className={styles.buttonContainer}>
//         {isSocietyMember === true && (
//           <Button
//             onClick={() => joinSociety(sid.sid ?? "")}
//             renderIcon={PortInput}
//           >
//             Click to Join
//           </Button>
//         )}
//         {isSocietyMember === false && (
//           <Button
//             onClick={() => {
//               setModal(!modal);
//               setModalContext("leaveSociety");
//             }}
//             renderIcon={PortInput}
//             kind={"danger"}
//           >
//             Click to Leave
//           </Button>
//         )}
//       </div>
//     </div>
//     <div className={styles.middleContent}>
//       <h2>About Us</h2>
//       <p>{societyData.description}</p>
//     </div>
//     <div className={styles.bottomContainer}>
//       <h2>Who's Involved</h2>
//       <Button>Edit</Button>
//       <div className={styles.cardContainer}>
//
//       </div>
//     </div>
//   </div>
//   <ElectionModal modal={modal}>
//     {modalContext === "createElection" && (
//       <form ref={electionForm} onSubmit={createElectionSubmit}>
//         <h3>Create Election</h3>
//         <TextInput
//           id={"election_name"}
//           labelText={"Election Name"}
//           type={"text"}
//           name={"name"}
//           required={true}
//         />
//         <TextInput
//           id={"description"}
//           labelText={"Description"}
//           type={"text"}
//           name={"description"}
//           required={true}
//         />
//         <NumberInput
//           id={"kValue"}
//           label={"K-anonymity value"}
//           size={"lg"}
//           min={1}
//           max={10}
//           defaultValue={2}
//           required={true}
//           onChange={kValueHandler}
//         />
//         <div className={styles.datePicker}>
//           <DatePicker
//             datePickerType="range"
//             onChange={event => {
//               setStartDate(event[0].toISOString().split("T")[0]);
//               setEndDate(event[1].toISOString().split("T")[0]);
//             }}
//             minDate={startOfDay(new Date()).toISOString()}
//           >
//             <DatePickerInput
//               id="date-picker-input-id-start"
//               placeholder="mm/dd/yyyy"
//               labelText="Start date"
//             />
//             <DatePickerInput
//               id="date-picker-input-id-finish"
//               placeholder="mm/dd/yyyy"
//               labelText="End date"
//             />
//           </DatePicker>
//         </div>
//         <TimePicker
//           onChange={event => {
//             setStartTime(event.target.value);
//           }}
//           defaultValue={"12:00"}
//           id="time-picker"
//           labelText="Select a start time"
//           pattern={"[0-9]{2}:[0-9]{2}"}
//         >
//           <TimePickerSelect
//             id="time-picker-select-2"
//             defaultValue="UTC"
//             onChange={event => setStartTimeZone(event.target.value)}
//           >
//             <SelectItem value="BST" text="BST" />
//             <SelectItem value="UTC" text="UTC" />
//           </TimePickerSelect>
//         </TimePicker>
//         <TimePicker
//           id="time-picker"
//           labelText="Select a finish time"
//           defaultValue={"12:00"}
//           pattern={"[0-9]{2}:[0-9]{2}"}
//           onChange={event => {
//             setEndTime(event.target.value);
//           }}
//         >
//           <TimePickerSelect
//             id="time-picker-select-2"
//             defaultValue="UTC"
//             onChange={event => {
//               setEndTimeZone(event.target.value);
//             }}
//           >
//             <SelectItem value="BST" text="BST" />
//             <SelectItem value="UTC" text="UTC" />
//           </TimePickerSelect>
//         </TimePicker>
//         <FileUploader
//           buttonLabel={"Upload a picture"}
//           filenameStatus={"complete"}
//           onChange={handleFileUpload}
//           className={styles.fileUploader}
//           accept={[".jpg", ".png", ".jpeg"]}
//         >
//           Upload Profile Picture
//         </FileUploader>
//         <Button
//           onClick={() => setModal(!modal)}
//           renderIcon={Close}
//           kind={"danger"}
//         >
//           Cancel
//         </Button>
//         <Button renderIcon={PortInput} kind={"primary"} type={"submit"}>
//           Create
//         </Button>
//       </form>
//     )}
//     {modalContext === "editSociety" && (
//       <div className={styles.modal}>
//         <form
//           aria-label={"Edit Society Form"}
//           ref={editSocietiesForm}
//           onSubmit={editSocietySubmit}
//         >
//           <h3>Editing society</h3>
//           <TextInput
//             id={"societyName"}
//             labelText={"Society Name"}
//             type={"text"}
//             name={"name"}
//             defaultValue={societyData.name}
//           />
//           <ComboBox
//             className={styles.comboBox}
//             id={"subject"}
//             aria-label={"Select a subject"}
//             items={getSocietySubject.map(subject => subject.name)}
//             onChange={comboBoxHandler}
//             placeholder={"Select a subject"}
//             defaultValue={societyData.SocietySubject.subjectId}
//           />
//           <TextArea
//             className={styles.textArea}
//             id={"societyDescription"}
//             labelText={"Society Description"}
//             type={"text"}
//             name={"description"}
//             defaultValue={societyData.description}
//           />
//           <FileUploader
//             buttonLabel={"Upload a picture"}
//             filenameStatus={"complete"}
//             onChange={handleFileUpload}
//             className={styles.fileUploader}
//             accept={[".jpg", ".png", ".jpeg"]}
//           >
//             Upload Profile Picture
//           </FileUploader>
//           <p>JPG, PNG, JPEG files only</p>
//           <Button
//             renderIcon={Close}
//             kind={"danger"}
//             onClick={() => setModal(!modal)}
//           >
//             Close
//           </Button>
//           <Button type={"submit"} renderIcon={PortInput} kind={"primary"}>
//             Confirm
//           </Button>
//         </form>
//       </div>
//     )}
//     {modalContext === "deleteSociety" && (
//       <div>
//         <p>
//           Are you sure you want to delete this society? This action is
//           irreversible. All candidates will be removed and all elections
//           will be deleted.
//         </p>
//         <Button renderIcon={Close} onClick={() => setModal(!modal)}>
//           Close
//         </Button>
//         <Button
//           renderIcon={PortInput}
//           kind={"danger"}
//           onClick={() => deleteSocietyHandler(sid)}
//         >
//           Confirm
//         </Button>
//       </div>
//     )}
//     {modalContext === "leaveSociety" && (
//       <div>
//         <p>
//           You are about to leave this society. You can join back at any
//           time from the society's page.
//         </p>
//         <Button renderIcon={Close} onClick={() => setModal(!modal)}>
//           Close
//         </Button>
//         <Button
//           renderIcon={PortInput}
//           kind={"danger"}
//           onClick={() => {
//             setModal(!modal);
//             leaveSociety(sid.sid ?? "");
//           }}
//         >
//           Confirm
//         </Button>
//       </div>
//     )}
//   </ElectionModal>
// </div>

// const createElectionSubmit = async (event: FormEvent) => {
//   event.preventDefault();
//   const formData = new FormData(electionForm.current ?? undefined);
//   formData.append("voterId", voterId ?? "");
//   formData.append("societyId", sid.sid!.toString() ?? "");
//   formData.append("kValue", kValue.toString() ?? "");
//   formData.append("startDate", startDate);
//   formData.append("endDate", endDate);
//   formData.append("startTime", startTime);
//   formData.append("endTime", endTime);
//   formData.append("startTimeZone", startTimeZone);
//   formData.append("endTimeZone", endTimeZone);
//
//   const body = Object.fromEntries(formData.entries());
//   const response = await post("election/create", body);
//   console.log(response);
//   const responseMessage = (await response.json()).message;
//
//   if (picture !== null) {
//     const fileResponse = await postFile(
//       `election/upload-election-picture/${responseMessage.newElection}`,
//       picture
//     );
//     if (!fileResponse.ok) {
//       alert("Failed to upload file");
//     }
//   }
//   if (response.ok) {
//     setSuccess(responseMessage);
//     setError(null);
//     setModal(!modal);
//   } else {
//     setSuccess(null);
//     setError(responseMessage);
//   }
// };

//
// const kValueHandler = (event, newValue) => {
//   setKValue(newValue.value);
// };
// const deleteSocietyHandler = async societyId => {
//   setDeleteSocieties(societyId.sid);
// };

// const handleFileUpload = event => {
//   const file = event.target.files[0];
//   setPicture(file);
// };
//

// const [kValue, setKValue] = useState<number>(2);
// const [startDate, setStartDate] = useState("");
// const [endDate, setEndDate] = useState("");
// const [startTime, setStartTime] = useState("12:00");
// const [endTime, setEndTime] = useState("12:00");
// const [startTimeZone, setStartTimeZone] = useState("GMT");
// const [endTimeZone, setEndTimeZone] = useState("GMT");
