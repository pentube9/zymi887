import './BackToUsersButton.css';

function BackToUsersButton({ onClick }) {
  return (
    <button className="back-to-users-btn" onClick={onClick}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
      <span>Back to Users</span>
    </button>
  );
}

export default BackToUsersButton;
