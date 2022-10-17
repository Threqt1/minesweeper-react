import volume from "../../../data/img/volume_up.png";
import "./VolumeToggle.scss";

const VolumeToggle = () => {
  return (
    <div className="volumeToggle">
      <img src={volume} className="volumeImage" />
    </div>
  );
};

export default VolumeToggle;
