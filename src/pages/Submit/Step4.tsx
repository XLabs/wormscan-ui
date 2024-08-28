import { ChevronLeftIcon, FileIcon, TrashIcon, UploadIcon } from "src/icons/generic";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { toast } from "react-toastify";

interface Step4Props {
  addedVAAs: any[];
  contactInfo: string;
  lastMoreInfo: string;
  lastVaaInput: string;
  logos: string[];
  sendProtocol: () => Promise<void>;
  setAddedVAAs: (a: any) => void;
  setContactInfo: (str: string) => void;
  setLastMoreInfo: (str: string) => void;
  setLastVaaInput: (str: string) => void;
  setLogos: (a: string[]) => void;
  setStep: (n: number) => void;
}

export const Step4 = ({
  addedVAAs,
  contactInfo,
  lastMoreInfo,
  lastVaaInput,
  logos,
  sendProtocol,
  setAddedVAAs,
  setContactInfo,
  setLastMoreInfo,
  setLastVaaInput,
  setLogos,
  setStep,
}: Step4Props) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log({ acceptedFiles });
      const file = acceptedFiles[0];

      if (file) {
        // check less than 3MB
        if (file.size > 3 * 1024 * 1024) {
          toast("The logo cant have more than 3MB", {
            type: "error",
            theme: "dark",
          });
          return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
          const result = reader.result as string;
          setLogos([...logos, result]);
          console.log(result);
        };

        reader.readAsDataURL(file);
      }
    },
    [logos, setLogos],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg"],
    },
  });

  return (
    <>
      <div className="parse-submit">
        <div className="parse-submit-progress">
          <div className={"parse-submit-progress-line active"} />
          <div className={"parse-submit-progress-line active"} />
          <div className={"parse-submit-progress-line active"} />
          <div className={"parse-submit-progress-line active"} />
        </div>

        <div className="parse-submit-step">STEP 04</div>
        <div className="parse-submit-title">Tell Us More</div>

        <div className="submit-last">
          <div className="submit-last-container">
            <div className="submit-last-title">Add more VAAs or txHashes (optional)</div>

            <div className="submit-last-inputContainer">
              <input
                className="parse-submit-input"
                placeholder="VAA / txHash"
                value={lastVaaInput}
                onChange={e => setLastVaaInput(e.target.value)}
              />
              <div
                className="submit-btn"
                onClick={() => {
                  setAddedVAAs([...addedVAAs, lastVaaInput]);
                  setLastVaaInput("");
                }}
              >
                Add
              </div>
            </div>

            {addedVAAs.map((addedVAA, idx) => (
              <div className="submit-last-inputContainer" key={addedVAA}>
                <input
                  className="parse-submit-input"
                  placeholder="VAA / txHash"
                  value={addedVAA}
                  disabled
                />
                <TrashIcon
                  width={26}
                  className="parse-submit-trash"
                  onClick={() => {
                    const newAddedVAAs = [...addedVAAs];
                    newAddedVAAs.splice(idx, 1);

                    setAddedVAAs(newAddedVAAs);
                  }}
                />
              </div>
            ))}

            <br />
            <br />
            <div className="submit-last-title">
              <p>Leave any additional notes (optional)</p>
              {/* 
              <p>
                Ex. If there is some field in the payload that would be nice to show in the overview
                of the transaction, or if some fields should be grouped in a object for better
                understanding, etc.
              </p> */}
            </div>

            <div className="submit-last-info">
              <textarea
                className="submit-last-info-input"
                placeholder="Write your note..."
                onChange={ev => setLastMoreInfo(ev.target.value.substring(0, 5000))}
                value={lastMoreInfo}
                aria-label="More Information text area"
                draggable={false}
                spellCheck={false}
              />
              <div className="submit-last-info-length">{lastMoreInfo.length} / 5000</div>
            </div>

            <br />
            <br />

            <div className="submit-last-title">
              <p>Upload the Protocol’s logo</p>
            </div>

            <div {...getRootProps()} className="submit-last-info">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>ACTIVO</p>
              ) : (
                <div className="submit-last-info-drag">
                  <UploadIcon />
                  <span>Drag & drop files or</span>
                  <span className="submit-last-info-drag-browse">browse</span>
                </div>
              )}
            </div>

            {logos.map((logo, idx) => (
              <div key={`logo-${idx}`} className="submit-last-logo">
                <FileIcon />
                <span>logo {idx + 1}</span>
                <img src={logo} alt="Uploaded Logo" />
                <TrashIcon
                  width={26}
                  onClick={() => {
                    setLogos([...logos.slice(0, idx), ...logos.slice(idx + 1)]);
                  }}
                />
              </div>
            ))}

            <br />
            <br />

            <div className="submit-last-title">
              <p>Provide contact information</p>
            </div>

            <input
              className="parse-submit-input"
              placeholder="email or GitHub username"
              value={contactInfo}
              onChange={e => setContactInfo(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 36, width: 2, height: 2 }} />
        <div className="parse-submit-line" />

        <div className="submit-steps">
          <div
            className="submit-steps-btn-prev"
            onClick={() => {
              setStep(2);
              window.scrollTo(0, 0);
            }}
          >
            <ChevronLeftIcon />
            Previous Step
          </div>
          <div onClick={sendProtocol} className={"submit-steps-btn-next"}>
            Submit
          </div>
        </div>
      </div>
    </>
  );
};
