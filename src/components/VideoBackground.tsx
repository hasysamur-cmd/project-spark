import { useLeagueStore } from '@/store/leagueStore';

export const VideoBackground = () => {
  const { settings } = useLeagueStore();

  if (!settings.backgroundVideo) return null;

  return (
    <video
      className="video-background"
      autoPlay
      muted
      loop
      playsInline
    >
      <source src={settings.backgroundVideo} type="video/mp4" />
    </video>
  );
};
