import "./styles.scss";

const WormholeScanBrand = ({ pos = "horizontal" }: { pos?: "vertical" | "horizontal" }) => {
  return (
    <div className="wormholescan-brand">
      {pos === "vertical" ? (
        <svg
          width={181}
          height={36}
          viewBox="0 0 181 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M31.3173 16.6903C31.3887 17.1162 31.4259 17.5538 31.4259 18C31.4259 18.4462 31.3887 18.8838 31.3173 19.3097L34.9178 19.3097V16.6903L31.3173 16.6903Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M30.3387 21.9909C29.8837 22.7613 29.301 23.4473 28.6197 24.0197L31.5722 27.569L33.5853 25.8936L30.3387 21.9909Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M27.0365 25.0535C26.243 25.4445 25.3739 25.7054 24.4571 25.8085L24.8812 33.1131L27.4956 32.9613L27.0365 25.0535Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M23.2193 25.8505C22.2976 25.8101 21.4171 25.6108 20.6045 25.2793L16.2648 34.9251L18.653 36L23.2193 25.8505Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M19.7123 24.8475C18.9356 24.4089 18.241 23.8419 17.6573 23.1754L7.85006 32.0668L9.60886 34.0076L19.7123 24.8475Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M17.1347 22.5098C16.6341 21.7966 16.2491 20.9964 16.0067 20.1364L1.87401 25.507L2.80412 27.9556L17.1347 22.5098Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M15.8215 19.3097C15.7501 18.8838 15.7129 18.4462 15.7129 18C15.7129 17.5538 15.7501 17.1162 15.8215 16.6903H0V19.3097H15.8215Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M16.0058 15.8668L1.92104 10.5201L2.85029 8.07117L17.1328 13.4929C16.6325 14.2063 16.2478 15.0067 16.0058 15.8668Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M17.6915 12.7858C18.2795 12.1232 18.9779 11.5606 19.7577 11.127L9.61432 1.82578L7.84459 3.75656L17.6915 12.7858Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M20.6045 10.7207C21.4171 10.3892 22.2976 10.1899 23.2193 10.1495L18.653 0L16.2648 1.0749L20.6045 10.7207Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M24.4521 10.1909C25.369 10.2934 26.2382 10.5538 27.032 10.9442L27.4956 2.86624L24.8811 2.71611L24.4521 10.1909Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M28.6197 11.9803C29.301 12.5527 29.8838 13.2387 30.3388 14.0091L33.5854 10.1064L31.5722 8.43104L28.6197 11.9803Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M170.227 7.32193H178.625V9.45824H170.227V12.4984H180.991V15.0127H166.826V3H180.991V5.51428H170.227V7.32193Z"
            fill="white"
          />
          <path d="M156.622 3V12.4984H166.021V15.0127H153.22V3H156.622Z" fill="white" />
          <path
            d="M141.305 5.51428C140.615 5.51428 140.27 5.83746 140.27 6.48384V11.5124C140.27 12.1697 140.615 12.4984 141.305 12.4984H147.336C148.026 12.4984 148.371 12.1697 148.371 11.5124V6.48384C148.371 5.83746 148.026 5.51428 147.336 5.51428H141.305ZM140.155 15.0127C137.963 15.0127 136.868 14.0376 136.868 12.0876V5.92511C136.868 3.97504 137.963 3 140.155 3H148.486C150.688 3 151.789 3.97504 151.789 5.92511V12.0876C151.789 14.0376 150.688 15.0127 148.486 15.0127H140.155Z"
            fill="white"
          />
          <path
            d="M123.296 9.45824V15.0127H119.895V3H123.296V7.32193H132.055V3H135.457V15.0127H132.055V9.45824H123.296Z"
            fill="white"
          />
          <path
            d="M101.824 3C102.503 3 102.974 3.23554 103.237 3.70663L108.48 12.0876L113.705 3.70663C113.979 3.23554 114.45 3 115.119 3H116.581C117.819 3 118.438 3.58064 118.438 4.74192V15.0127H115.414V6.8125L110.632 14.306C110.348 14.7771 109.926 15.0127 109.367 15.0127H107.592C107.044 15.0127 106.617 14.7771 106.31 14.306L101.545 6.8125V15.0127H98.5211V4.74192C98.5211 3.58064 99.1346 3 100.362 3H101.824Z"
            fill="white"
          />
          <path
            d="M82.4931 3H94.0456C96.2477 3 97.3487 3.97504 97.3487 5.92511V7.71632C97.3487 9.54589 96.3956 10.5154 94.4893 10.625L97.9403 14.8812V15.0127H94.1607L90.6439 10.6414H85.8948V15.0127H82.4931V3ZM93.9799 6.45097C93.9799 5.79364 93.6348 5.46498 92.9446 5.46498H85.8948V8.48869H92.9446C93.6348 8.48869 93.9799 8.16002 93.9799 7.50269V6.45097Z"
            fill="white"
          />
          <path
            d="M70.578 5.51428C69.8878 5.51428 69.5427 5.83746 69.5427 6.48384V11.5124C69.5427 12.1697 69.8878 12.4984 70.578 12.4984H76.609C77.2992 12.4984 77.6443 12.1697 77.6443 11.5124V6.48384C77.6443 5.83746 77.2992 5.51428 76.609 5.51428H70.578ZM69.4277 15.0127C67.2366 15.0127 66.141 14.0376 66.141 12.0876V5.92511C66.141 3.97504 67.2366 3 69.4277 3H77.7593C79.9613 3 81.0624 3.97504 81.0624 5.92511V12.0876C81.0624 14.0376 79.9613 15.0127 77.7593 15.0127H69.4277Z"
            fill="white"
          />
          <path
            d="M56.6543 12.4984H60.4504C61.0858 12.4984 61.4035 12.2026 61.4035 11.611V3H64.7559V12.4162C64.7559 14.1472 63.7589 15.0127 61.7651 15.0127H48.2898C46.3069 15.0127 45.3154 14.1472 45.3154 12.4162V3H48.6678V11.611C48.6678 12.2026 48.98 12.4984 49.6045 12.4984H53.4499V3H56.6543V12.4984Z"
            fill="white"
          />
          <path
            d="M108.73 21.4873V31.7581C108.73 32.9194 108.117 33.5 106.89 33.5H105.197C104.868 33.5 104.567 33.4452 104.293 33.3357C104.03 33.2261 103.806 33.0508 103.619 32.8098L95.8959 24.2481V33.5H92.8722V23.2293C92.8722 22.068 93.4857 21.4873 94.7127 21.4873H96.4053C96.734 21.4873 97.0353 21.5421 97.3091 21.6517C97.583 21.7612 97.8131 21.9365 97.9993 22.1775L105.723 30.7557V21.4873H108.73Z"
            fill="white"
          />
          <path
            d="M88.4545 21.4873C90.4374 21.4873 91.4289 22.3528 91.4289 24.0838V33.5H88.0108V29.6382H79.8599V33.5H76.4583V24.0838C76.4583 22.3528 77.4497 21.4873 79.4327 21.4873H88.4545ZM79.8599 27.5183H88.0108V24.8726C88.0108 24.2919 87.6986 24.0016 87.0741 24.0016H80.813C80.1776 24.0016 79.8599 24.2919 79.8599 24.8726V27.5183Z"
            fill="white"
          />
          <path
            d="M64.7604 30.0983C64.7604 30.6899 65.0781 30.9857 65.7135 30.9857H75.3434V33.5H64.3331C62.3502 33.5 61.3587 32.6345 61.3587 30.9036V24.0838C61.3587 22.3528 62.3502 21.4873 64.3331 21.4873H75.3434V24.0016H65.7135C65.0781 24.0016 64.7604 24.2919 64.7604 24.8726V30.0983Z"
            fill="white"
          />
          <path
            d="M56.9583 25.8093C59.1823 25.8093 60.2943 26.7843 60.2943 28.7344V30.5749C60.2943 32.525 59.1823 33.5 56.9583 33.5H46.096V30.9857H55.8409C56.5639 30.9857 56.9255 30.6571 56.9255 29.9997V28.9316C56.9255 28.2742 56.5639 27.9456 55.8409 27.9456H49.1526C47.093 27.9456 46.0631 27.0856 46.0631 25.3656V24.0674C46.0631 22.3473 47.093 21.4873 49.1526 21.4873H59.8342V24.0016H50.2536C49.7058 24.0016 49.4319 24.2098 49.4319 24.6261V25.1684C49.4319 25.5956 49.7058 25.8093 50.2536 25.8093H56.9583Z"
            fill="white"
          />
        </svg>
      ) : (
        <svg
          width={217}
          height={32}
          viewBox="0 0 217 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M27.876 14.8358C27.9396 15.2144 27.9727 15.6033 27.9727 16C27.9727 16.3966 27.9396 16.7856 27.876 17.1642L31.0809 17.1642V14.8358L27.876 14.8358Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M27.005 19.5474C26.6 20.2323 26.0813 20.8421 25.4748 21.3509L28.1029 24.5057L29.8948 23.0165L27.005 19.5474Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M24.0656 22.2698C23.3593 22.6173 22.5857 22.8493 21.7697 22.9409L22.1471 29.4339L24.4743 29.2989L24.0656 22.2698Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M20.6679 22.9782C19.8474 22.9423 19.0637 22.7651 18.3404 22.4705L14.4776 31.0445L16.6033 32L20.6679 22.9782Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M17.5462 22.0867C16.8549 21.6968 16.2366 21.1928 15.717 20.6003L6.98746 28.5038L8.55299 30.229L17.5462 22.0867Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M15.2519 20.0087C14.8063 19.3748 14.4636 18.6635 14.2478 17.899L1.66809 22.6729L2.496 24.8494L15.2519 20.0087Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M14.083 17.1642C14.0194 16.7856 13.9863 16.3966 13.9863 16C13.9863 15.6033 14.0194 15.2144 14.083 14.8358H0V17.1642H14.083Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M14.247 14.1038L1.70994 9.35121L2.53709 7.17438L15.2501 11.9937C14.8049 12.6279 14.4624 13.3393 14.247 14.1038Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M15.7475 11.3652C16.2709 10.7761 16.8925 10.2761 17.5867 9.89066L8.55786 1.62292L6.98259 3.33917L15.7475 11.3652Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M18.3404 9.52947C19.0637 9.23486 19.8474 9.05772 20.6679 9.02178L16.6033 0L14.4776 0.955469L18.3404 9.52947Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M21.7652 9.05857C22.5813 9.14971 23.3551 9.38116 24.0616 9.72821L24.4743 2.54777L22.1471 2.41432L21.7652 9.05857Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M25.4749 10.6491C26.0813 11.1579 26.6 11.7677 27.005 12.4526L29.8948 8.98347L28.1029 7.49426L25.4749 10.6491Z"
            fill="var(--color-primary-100)"
          />
          <path
            d="M216.115 10.7656V19.5156C216.115 20.505 215.593 20.9996 214.547 20.9996H213.105C212.825 20.9996 212.569 20.953 212.335 20.8596C212.111 20.7663 211.92 20.617 211.761 20.4116L205.181 13.1176V20.9996H202.605V12.2496C202.605 11.2603 203.128 10.7656 204.173 10.7656H205.615C205.895 10.7656 206.152 10.8123 206.385 10.9056C206.619 10.999 206.815 11.1483 206.973 11.3536L213.553 18.6616V10.7656H216.115Z"
            fill="white"
          />
          <path
            d="M198.842 10.7656C200.531 10.7656 201.376 11.503 201.376 12.9776V20.9996H198.464V17.7096H191.52V20.9996H188.622V12.9776C188.622 11.503 189.467 10.7656 191.156 10.7656H198.842ZM191.52 15.9036H198.464V13.6496C198.464 13.155 198.198 12.9076 197.666 12.9076H192.332C191.791 12.9076 191.52 13.155 191.52 13.6496V15.9036Z"
            fill="white"
          />
          <path
            d="M178.657 18.1016C178.657 18.6056 178.927 18.8576 179.469 18.8576H187.673V20.9996H178.293C176.603 20.9996 175.759 20.2623 175.759 18.7876V12.9776C175.759 11.503 176.603 10.7656 178.293 10.7656H187.673V12.9076H179.469C178.927 12.9076 178.657 13.155 178.657 13.6496V18.1016Z"
            fill="white"
          />
          <path
            d="M172.01 14.4476C173.904 14.4476 174.852 15.2783 174.852 16.9396V18.5076C174.852 20.169 173.904 20.9996 172.01 20.9996H162.756V18.8576H171.058C171.674 18.8576 171.982 18.5776 171.982 18.0176V17.1076C171.982 16.5476 171.674 16.2676 171.058 16.2676H165.36C163.605 16.2676 162.728 15.535 162.728 14.0696V12.9636C162.728 11.4983 163.605 10.7656 165.36 10.7656H174.46V12.9076H166.298C165.831 12.9076 165.598 13.085 165.598 13.4396V13.9016C165.598 14.2656 165.831 14.4476 166.298 14.4476H172.01Z"
            fill="white"
          />
          <path
            d="M147.382 14.4476H154.536V16.2676H147.382V18.8576H156.552V20.9996H144.484V10.7656H156.552V12.9076H147.382V14.4476Z"
            fill="white"
          />
          <path d="M135.792 10.7656V18.8576H143.8V20.9996H132.894V10.7656H135.792Z" fill="white" />
          <path
            d="M122.743 12.9076C122.155 12.9076 121.861 13.183 121.861 13.7336V18.0176C121.861 18.5776 122.155 18.8576 122.743 18.8576H127.881C128.469 18.8576 128.763 18.5776 128.763 18.0176V13.7336C128.763 13.183 128.469 12.9076 127.881 12.9076H122.743ZM121.763 20.9996C119.896 20.9996 118.963 20.169 118.963 18.5076V13.2576C118.963 11.5963 119.896 10.7656 121.763 10.7656H128.861C130.737 10.7656 131.675 11.5963 131.675 13.2576V18.5076C131.675 20.169 130.737 20.9996 128.861 20.9996H121.763Z"
            fill="white"
          />
          <path
            d="M107.4 16.2676V20.9996H104.502V10.7656H107.4V14.4476H114.862V10.7656H117.76V20.9996H114.862V16.2676H107.4Z"
            fill="white"
          />
          <path
            d="M89.1079 10.7656C89.6866 10.7656 90.0879 10.9663 90.3119 11.3676L94.7779 18.5076L99.2299 11.3676C99.4633 10.9663 99.8646 10.7656 100.434 10.7656H101.68C102.735 10.7656 103.262 11.2603 103.262 12.2496V20.9996H100.686V14.0136L96.6119 20.3976C96.3693 20.799 96.0099 20.9996 95.5339 20.9996H94.0219C93.5553 20.9996 93.1913 20.799 92.9299 20.3976L88.8699 14.0136V20.9996H86.2939V12.2496C86.2939 11.2603 86.8166 10.7656 87.8619 10.7656H89.1079Z"
            fill="white"
          />
          <path
            d="M72.6387 10.7656H82.4807C84.3567 10.7656 85.2947 11.5963 85.2947 13.2576V14.7836C85.2947 16.3423 84.4827 17.1683 82.8587 17.2616L85.7987 20.8876V20.9996H82.5787L79.5827 17.2756H75.5367V20.9996H72.6387V10.7656ZM82.4247 13.7056C82.4247 13.1456 82.1307 12.8656 81.5427 12.8656H75.5367V15.4416H81.5427C82.1307 15.4416 82.4247 15.1616 82.4247 14.6016V13.7056Z"
            fill="white"
          />
          <path
            d="M62.488 12.9076C61.9 12.9076 61.606 13.183 61.606 13.7336V18.0176C61.606 18.5776 61.9 18.8576 62.488 18.8576H67.626C68.214 18.8576 68.508 18.5776 68.508 18.0176V13.7336C68.508 13.183 68.214 12.9076 67.626 12.9076H62.488ZM61.508 20.9996C59.6413 20.9996 58.708 20.169 58.708 18.5076V13.2576C58.708 11.5963 59.6413 10.7656 61.508 10.7656H68.606C70.482 10.7656 71.42 11.5963 71.42 13.2576V18.5076C71.42 20.169 70.482 20.9996 68.606 20.9996H61.508Z"
            fill="white"
          />
          <path
            d="M50.6258 18.8576H53.8598C54.4012 18.8576 54.6718 18.6056 54.6718 18.1016V10.7656H57.5278V18.7876C57.5278 20.2623 56.6785 20.9996 54.9798 20.9996H43.4998C41.8105 20.9996 40.9658 20.2623 40.9658 18.7876V10.7656H43.8218V18.1016C43.8218 18.6056 44.0878 18.8576 44.6198 18.8576H47.8958V10.7656H50.6258V18.8576Z"
            fill="white"
          />
        </svg>
      )}
    </div>
  );
};

export default WormholeScanBrand;