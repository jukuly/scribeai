import './appMinimized.scss';

export function AppMinimized() {
  window.api.getConfig().then(config => {
    if(!config.minimize) window.api.expand();
  });

  return (
    <div className='full-screen'>
      <div className='app'>

      </div>
    </div>
  );
}