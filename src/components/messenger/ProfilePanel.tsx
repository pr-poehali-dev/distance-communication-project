export default function ProfilePanel() {
  return (
    <div className="panel-inner">
      <div className="panel-header">
        <h2>Профиль</h2>
      </div>
      <div className="profile-body">
        <div className="profile-avatar">ВП</div>
        <h3 className="profile-name">Владимир Павлов</h3>
        <p className="profile-status">В сети</p>
        <div className="profile-fields">
          <div className="profile-field">
            <span className="field-label">Имя пользователя</span>
            <span className="field-value">@vladpavlov</span>
          </div>
          <div className="profile-field">
            <span className="field-label">Телефон</span>
            <span className="field-value">+7 (999) 123-45-67</span>
          </div>
          <div className="profile-field">
            <span className="field-label">О себе</span>
            <span className="field-value">Всегда на связи</span>
          </div>
        </div>
      </div>
    </div>
  );
}
