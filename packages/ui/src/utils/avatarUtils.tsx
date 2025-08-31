import React from 'react';
import {
  FaUser, FaUserTie, FaRobot, FaUserAstronaut,
  FaUserNinja, FaUserSecret, FaBrain, FaHeart,
  FaUserGraduate, FaUserInjured, FaUserLock, 
  FaUserNurse, FaSlack, FaPhoneVolume, FaWifi
} from 'react-icons/fa';
import { 
  FaPersonMilitaryPointing,
  FaPersonWalkingLuggage
} from 'react-icons/fa6';
import {
  GiGraduateCap, GiRobe, GiSly, GiSprint, GiAtom, GiRibbonMedal,
  GiFilmSpool, GiScales, GiCook, GiTiredEye, GiSwan, GiSquirrel,
  GiSpinalCoil, GiSinagot, GiMusicSpell, GiFox, GiAgave, GiDeer,
  GiDeerHead, GiElephant, GiGecko, GiGoldScarab
} from 'react-icons/gi';
import {
  RiCustomerService2Fill, RiServiceLine, RiUserStarFill, RiUserSettingsFill,
  RiUserStarLine, RiAuctionFill, RiMicroscopeFill, RiSave2Fill, RiSave3Fill
} from 'react-icons/ri';
import { DiYeoman, DiProlog } from 'react-icons/di';
import {
  Si1001Tracklists, SiAlienware, SiAudacity, SiBamboo, SiBrave,
  Si4Chan, Si3M, SiHuawei, SiFigshare, SiFireship, SiIcinga, SiIcq
} from 'react-icons/si';
import { LiaUserNurseSolid } from 'react-icons/lia';
import { ImUserTie, ImSteam2, ImBubbles, ImWrench, ImVideoCamera, ImHipster2, ImHipster, ImMeter2, ImQrcode, ImSpoonKnife } from 'react-icons/im';
import { BiSolidUserVoice } from 'react-icons/bi';
import { CgUserlane } from 'react-icons/cg';
import { SlUserFemale } from 'react-icons/sl';
import {
  HiMiniUserGroup, HiMicrophone, HiMiniBeaker, HiMiniCamera, HiMiniCpuChip,
  HiMiniRocketLaunch, HiPrinter, HiTrash, HiTruck, HiWrenchScrewdriver,
  HiPresentationChartLine, HiBuildingStorefront
} from 'react-icons/hi2';
import {
  GrUserFemale, GrUserManager, GrUserPolice, GrUserWorker
} from 'react-icons/gr';
import {
  IoIosPeople, IoIosCalculator, IoIosAttach, IoIosKey, IoIosSpeedometer
} from 'react-icons/io';
import {
  IoMdSettings, IoMdOptions
} from 'react-icons/io';
import {
  IoBarChart, IoThunderstorm, IoWalk, IoWomanSharp
} from 'react-icons/io5';
import {
  MdFace2, MdFace3, MdFace4, MdFace, MdDiversity2, MdBarcodeReader,
  MdJoinFull, MdJoinInner, MdJoinRight, MdLockClock, MdNoEncryption,
  MdMarkEmailRead, MdOutlineBluetoothSearching, MdOutlineWarning, MdAutoFixHigh
} from 'react-icons/md';
import { TbAlien, TbAlienFilled } from 'react-icons/tb';
import { BsFillPersonVcardFill } from 'react-icons/bs';
import { TiVendorMicrosoft, TiVendorApple, TiVendorAndroid } from 'react-icons/ti';
import { VscGithubInverted } from 'react-icons/vsc';

// 头像映射表：从字符串名称到React图标的映射
export const avatarIconMap = {
  // 原有图标
  user: <FaUser key="user" />,
  tie: <FaUserTie key="tie" />,
  robot: <FaRobot key="robot" />,
  astronaut: <FaUserAstronaut key="astronaut" />,
  ninja: <FaUserNinja key="ninja" />,
  secret: <FaUserSecret key="secret" />,
  brain: <FaBrain key="brain" />,
  heart: <FaHeart key="heart" />,
  
  // 新增用户类图标
  graduate: <FaUserGraduate key="graduate" />,
  injured: <FaUserInjured key="injured" />,
  locked: <FaUserLock key="locked" />,
  military: <FaPersonMilitaryPointing key="military" />,
  nurse: <FaUserNurse key="nurse" />,
  graduateCap: <GiGraduateCap key="graduateCap" />,
  robe: <GiRobe key="robe" />,
  customerService: <RiCustomerService2Fill key="customerService" />,
  service: <RiServiceLine key="service" />,
  yeoman: <DiYeoman key="yeoman" />,
  alienware: <SiAlienware key="alienware" />,
  audacity: <SiAudacity key="audacity" />,
  nurseAlt: <LiaUserNurseSolid key="nurseAlt" />,
  userTieAlt: <ImUserTie key="userTieAlt" />,
  userVoice: <BiSolidUserVoice key="userVoice" />,
  userlane: <CgUserlane key="userlane" />,
  userFemale: <SlUserFemale key="userFemale" />,
  userGroup: <HiMiniUserGroup key="userGroup" />,
  userFemaleAlt: <GrUserFemale key="userFemaleAlt" />,
  userManager: <GrUserManager key="userManager" />,
  userPolice: <GrUserPolice key="userPolice" />,
  userWorker: <GrUserWorker key="userWorker" />,
  userStar: <RiUserStarFill key="userStar" />,
  userSettings: <RiUserSettingsFill key="userSettings" />,
  userStarLine: <RiUserStarLine key="userStarLine" />,
  sly: <GiSly key="sly" />,
  sprint: <GiSprint key="sprint" />,
  steam: <ImSteam2 key="steam" />,
  people: <IoIosPeople key="people" />,
  
  // 表情和面部图标
  face2: <MdFace2 key="face2" />,
  face3: <MdFace3 key="face3" />,
  face4: <MdFace4 key="face4" />,
  face: <MdFace key="face" />,
  diversity: <MdDiversity2 key="diversity" />,
  bubbles: <ImBubbles key="bubbles" />,
  
  // 外星人和机器人类
  alien: <TbAlien key="alien" />,
  alienFilled: <TbAlienFilled key="alienFilled" />,
  
  // 职业和工具类图标
  cook: <GiCook key="cook" />,
  traveler: <FaPersonWalkingLuggage key="traveler" />,
  vcard: <BsFillPersonVcardFill key="vcard" />,
  atom: <GiAtom key="atom" />,
  medal: <GiRibbonMedal key="medal" />,
  bamboo: <SiBamboo key="bamboo" />,
  film: <GiFilmSpool key="film" />,
  scales: <GiScales key="scales" />,
  phone: <FaPhoneVolume key="phone" />,
  wrench: <ImWrench key="wrench" />,
  video: <ImVideoCamera key="video" />,
  store: <HiBuildingStorefront key="store" />,
  microphone: <HiMicrophone key="microphone" />,
  beaker: <HiMiniBeaker key="beaker" />,
  camera: <HiMiniCamera key="camera" />,
  chip: <HiMiniCpuChip key="chip" />,
  rocket: <HiMiniRocketLaunch key="rocket" />,
  printer: <HiPrinter key="printer" />,
  trash: <HiTrash key="trash" />,
  truck: <HiTruck key="truck" />,
  screwdriver: <HiWrenchScrewdriver key="screwdriver" />,
  chart: <HiPresentationChartLine key="chart" />,
  hipster: <ImHipster key="hipster" />,
  hipster2: <ImHipster2 key="hipster2" />,
  calculator: <IoIosCalculator key="calculator" />,
  attach: <IoIosAttach key="attach" />,
  key: <IoIosKey key="key" />,
  settings: <IoMdSettings key="settings" />,
  options: <IoMdOptions key="options" />,
  barChart: <IoBarChart key="barChart" />,
  thunderstorm: <IoThunderstorm key="thunderstorm" />,
  walk: <IoWalk key="walk" />,
  woman: <IoWomanSharp key="woman" />,
  barcode: <MdBarcodeReader key="barcode" />,
  joinFull: <MdJoinFull key="joinFull" />,
  joinInner: <MdJoinInner key="joinInner" />,
  joinRight: <MdJoinRight key="joinRight" />,
  brave: <SiBrave key="brave" />,
  
  // 科技和工具类
  tired: <GiTiredEye key="tired" />,
  swan: <GiSwan key="swan" />,
  meter: <ImMeter2 key="meter" />,
  qrcode: <ImQrcode key="qrcode" />,
  spoon: <ImSpoonKnife key="spoon" />,
  speedometer: <IoIosSpeedometer key="speedometer" />,
  lockClock: <MdLockClock key="lockClock" />,
  noEncryption: <MdNoEncryption key="noEncryption" />,
  github: <VscGithubInverted key="github" />,
  
  // 动物类图标
  squirrel: <GiSquirrel key="squirrel" />,
  spinal: <GiSpinalCoil key="spinal" />,
  sinagot: <GiSinagot key="sinagot" />,
  musicSpell: <GiMusicSpell key="musicSpell" />,
  fox: <GiFox key="fox" />,
  agave: <GiAgave key="agave" />,
  deer: <GiDeer key="deer" />,
  deerHead: <GiDeerHead key="deerHead" />,
  elephant: <GiElephant key="elephant" />,
  gecko: <GiGecko key="gecko" />,
  scarab: <GiGoldScarab key="scarab" />,
  
  // 品牌和技术类
  prolog: <DiProlog key="prolog" />,
  slack: <FaSlack key="slack" />,
  email: <MdMarkEmailRead key="email" />,
  auction: <RiAuctionFill key="auction" />,
  microscope: <RiMicroscopeFill key="microscope" />,
  save2: <RiSave2Fill key="save2" />,
  save3: <RiSave3Fill key="save3" />,
  wifi: <FaWifi key="wifi" />,
  bluetooth: <MdOutlineBluetoothSearching key="bluetooth" />,
  warning: <MdOutlineWarning key="warning" />,
  autoFix: <MdAutoFixHigh key="autoFix" />,
  microsoft: <TiVendorMicrosoft key="microsoft" />,
  apple: <TiVendorApple key="apple" />,
  android: <TiVendorAndroid key="android" />,
  chan4: <Si4Chan key="chan4" />,
  threeM: <Si3M key="threeM" />,
  huawei: <SiHuawei key="huawei" />,
  figshare: <SiFigshare key="figshare" />,
  fireship: <SiFireship key="fireship" />,
  icinga: <SiIcinga key="icinga" />,
  icq: <SiIcq key="icq" />,
  tracklist: <Si1001Tracklists key="tracklist" />
};

// 头像选项数组，用于选择器
export const avatarOptions = [
  // 原有选项
  { key: 'user', icon: <FaUser key="user" />, name: '用户' },
  { key: 'tie', icon: <FaUserTie key="tie" />, name: '商务' },
  { key: 'robot', icon: <FaRobot key="robot" />, name: '机器人' },
  { key: 'astronaut', icon: <FaUserAstronaut key="astronaut" />, name: '宇航员' },
  { key: 'ninja', icon: <FaUserNinja key="ninja" />, name: '忍者' },
  { key: 'secret', icon: <FaUserSecret key="secret" />, name: '神秘' },
  { key: 'brain', icon: <FaBrain key="brain" />, name: '智慧' },
  { key: 'heart', icon: <FaHeart key="heart" />, name: '爱心' },
  
  // 新增用户类选项
  { key: 'graduate', icon: <FaUserGraduate key="graduate" />, name: '毕业生' },
  { key: 'injured', icon: <FaUserInjured key="injured" />, name: '医护' },
  { key: 'locked', icon: <FaUserLock key="locked" />, name: '安全' },
  { key: 'military', icon: <FaPersonMilitaryPointing key="military" />, name: '军官' },
  { key: 'nurse', icon: <FaUserNurse key="nurse" />, name: '护士' },
  { key: 'graduateCap', icon: <GiGraduateCap key="graduateCap" />, name: '学者' },
  { key: 'robe', icon: <GiRobe key="robe" />, name: '法官' },
  { key: 'customerService', icon: <RiCustomerService2Fill key="customerService" />, name: '客服' },
  { key: 'service', icon: <RiServiceLine key="service" />, name: '服务' },
  { key: 'yeoman', icon: <DiYeoman key="yeoman" />, name: '助手' },
  { key: 'alienware', icon: <SiAlienware key="alienware" />, name: '外星' },
  { key: 'audacity', icon: <SiAudacity key="audacity" />, name: '音频' },
  { key: 'nurseAlt', icon: <LiaUserNurseSolid key="nurseAlt" />, name: '医生' },
  { key: 'userTieAlt', icon: <ImUserTie key="userTieAlt" />, name: '经理' },
  { key: 'userVoice', icon: <BiSolidUserVoice key="userVoice" />, name: '播音' },
  { key: 'userlane', icon: <CgUserlane key="userlane" />, name: '引导' },
  { key: 'userFemale', icon: <SlUserFemale key="userFemale" />, name: '女性' },
  { key: 'userGroup', icon: <HiMiniUserGroup key="userGroup" />, name: '团队' },
  { key: 'userFemaleAlt', icon: <GrUserFemale key="userFemaleAlt" />, name: '女士' },
  { key: 'userManager', icon: <GrUserManager key="userManager" />, name: '管理' },
  { key: 'userPolice', icon: <GrUserPolice key="userPolice" />, name: '警察' },
  { key: 'userWorker', icon: <GrUserWorker key="userWorker" />, name: '工人' },
  { key: 'userStar', icon: <RiUserStarFill key="userStar" />, name: '明星' },
  { key: 'userSettings', icon: <RiUserSettingsFill key="userSettings" />, name: '配置' },
  { key: 'userStarLine', icon: <RiUserStarLine key="userStarLine" />, name: '评级' },
  { key: 'sly', icon: <GiSly key="sly" />, name: '狡猾' },
  { key: 'sprint', icon: <GiSprint key="sprint" />, name: '冲刺' },
  { key: 'steam', icon: <ImSteam2 key="steam" />, name: '蒸汽' },
  { key: 'people', icon: <IoIosPeople key="people" />, name: '群众' },
  
  // 表情和面部选项
  { key: 'face2', icon: <MdFace2 key="face2" />, name: '笑脸' },
  { key: 'face3', icon: <MdFace3 key="face3" />, name: '开心' },
  { key: 'face4', icon: <MdFace4 key="face4" />, name: '微笑' },
  { key: 'face', icon: <MdFace key="face" />, name: '表情' },
  { key: 'diversity', icon: <MdDiversity2 key="diversity" />, name: '多元' },
  { key: 'bubbles', icon: <ImBubbles key="bubbles" />, name: '泡泡' },
  
  // 外星人和机器人选项
  { key: 'alien', icon: <TbAlien key="alien" />, name: '外星人' },
  { key: 'alienFilled', icon: <TbAlienFilled key="alienFilled" />, name: '外星体' },
  
  // 职业和工具选项
  { key: 'cook', icon: <GiCook key="cook" />, name: '厨师' },
  { key: 'traveler', icon: <FaPersonWalkingLuggage key="traveler" />, name: '旅行' },
  { key: 'vcard', icon: <BsFillPersonVcardFill key="vcard" />, name: '名片' },
  { key: 'atom', icon: <GiAtom key="atom" />, name: '原子' },
  { key: 'medal', icon: <GiRibbonMedal key="medal" />, name: '奖章' },
  { key: 'bamboo', icon: <SiBamboo key="bamboo" />, name: '竹子' },
  { key: 'film', icon: <GiFilmSpool key="film" />, name: '电影' },
  { key: 'scales', icon: <GiScales key="scales" />, name: '天平' },
  { key: 'phone', icon: <FaPhoneVolume key="phone" />, name: '电话' },
  { key: 'wrench', icon: <ImWrench key="wrench" />, name: '扳手' },
  { key: 'video', icon: <ImVideoCamera key="video" />, name: '摄像' },
  { key: 'store', icon: <HiBuildingStorefront key="store" />, name: '商店' },
  { key: 'microphone', icon: <HiMicrophone key="microphone" />, name: '麦克风' },
  { key: 'beaker', icon: <HiMiniBeaker key="beaker" />, name: '实验' },
  { key: 'camera', icon: <HiMiniCamera key="camera" />, name: '摄影' },
  { key: 'chip', icon: <HiMiniCpuChip key="chip" />, name: '芯片' },
  { key: 'rocket', icon: <HiMiniRocketLaunch key="rocket" />, name: '火箭' },
  { key: 'printer', icon: <HiPrinter key="printer" />, name: '打印' },
  { key: 'trash', icon: <HiTrash key="trash" />, name: '清理' },
  { key: 'truck', icon: <HiTruck key="truck" />, name: '卡车' },
  { key: 'screwdriver', icon: <HiWrenchScrewdriver key="screwdriver" />, name: '螺丝刀' },
  { key: 'chart', icon: <HiPresentationChartLine key="chart" />, name: '图表' },
  { key: 'hipster', icon: <ImHipster key="hipster" />, name: '文艺' },
  { key: 'hipster2', icon: <ImHipster2 key="hipster2" />, name: '时尚' },
  { key: 'calculator', icon: <IoIosCalculator key="calculator" />, name: '计算器' },
  { key: 'attach', icon: <IoIosAttach key="attach" />, name: '附件' },
  { key: 'key', icon: <IoIosKey key="key" />, name: '钥匙' },
  { key: 'settings', icon: <IoMdSettings key="settings" />, name: '设置' },
  { key: 'options', icon: <IoMdOptions key="options" />, name: '选项' },
  { key: 'barChart', icon: <IoBarChart key="barChart" />, name: '柱状图' },
  { key: 'thunderstorm', icon: <IoThunderstorm key="thunderstorm" />, name: '雷暴' },
  { key: 'walk', icon: <IoWalk key="walk" />, name: '行走' },
  { key: 'woman', icon: <IoWomanSharp key="woman" />, name: '女人' },
  { key: 'barcode', icon: <MdBarcodeReader key="barcode" />, name: '条码' },
  { key: 'joinFull', icon: <MdJoinFull key="joinFull" />, name: '全连接' },
  { key: 'joinInner', icon: <MdJoinInner key="joinInner" />, name: '内连接' },
  { key: 'joinRight', icon: <MdJoinRight key="joinRight" />, name: '右连接' },
  { key: 'brave', icon: <SiBrave key="brave" />, name: '勇敢' },
  
  // 科技和工具选项
  { key: 'tired', icon: <GiTiredEye key="tired" />, name: '疲劳' },
  { key: 'swan', icon: <GiSwan key="swan" />, name: '天鹅' },
  { key: 'meter', icon: <ImMeter2 key="meter" />, name: '仪表' },
  { key: 'qrcode', icon: <ImQrcode key="qrcode" />, name: '二维码' },
  { key: 'spoon', icon: <ImSpoonKnife key="spoon" />, name: '餐具' },
  { key: 'speedometer', icon: <IoIosSpeedometer key="speedometer" />, name: '速度计' },
  { key: 'lockClock', icon: <MdLockClock key="lockClock" />, name: '时钟锁' },
  { key: 'noEncryption', icon: <MdNoEncryption key="noEncryption" />, name: '无加密' },
  { key: 'github', icon: <VscGithubInverted key="github" />, name: 'GitHub' },
  
  // 动物选项
  { key: 'squirrel', icon: <GiSquirrel key="squirrel" />, name: '松鼠' },
  { key: 'spinal', icon: <GiSpinalCoil key="spinal" />, name: '脊椎' },
  { key: 'sinagot', icon: <GiSinagot key="sinagot" />, name: '神话' },
  { key: 'musicSpell', icon: <GiMusicSpell key="musicSpell" />, name: '音乐魔法' },
  { key: 'fox', icon: <GiFox key="fox" />, name: '狐狸' },
  { key: 'agave', icon: <GiAgave key="agave" />, name: '龙舌兰' },
  { key: 'deer', icon: <GiDeer key="deer" />, name: '鹿' },
  { key: 'deerHead', icon: <GiDeerHead key="deerHead" />, name: '鹿头' },
  { key: 'elephant', icon: <GiElephant key="elephant" />, name: '大象' },
  { key: 'gecko', icon: <GiGecko key="gecko" />, name: '壁虎' },
  { key: 'scarab', icon: <GiGoldScarab key="scarab" />, name: '圣甲虫' },
  
  // 品牌和技术选项
  { key: 'prolog', icon: <DiProlog key="prolog" />, name: 'Prolog' },
  { key: 'slack', icon: <FaSlack key="slack" />, name: 'Slack' },
  { key: 'email', icon: <MdMarkEmailRead key="email" />, name: '邮件' },
  { key: 'auction', icon: <RiAuctionFill key="auction" />, name: '拍卖' },
  { key: 'microscope', icon: <RiMicroscopeFill key="microscope" />, name: '显微镜' },
  { key: 'save2', icon: <RiSave2Fill key="save2" />, name: '保存2' },
  { key: 'save3', icon: <RiSave3Fill key="save3" />, name: '保存3' },
  { key: 'wifi', icon: <FaWifi key="wifi" />, name: 'WiFi' },
  { key: 'bluetooth', icon: <MdOutlineBluetoothSearching key="bluetooth" />, name: '蓝牙' },
  { key: 'warning', icon: <MdOutlineWarning key="warning" />, name: '警告' },
  { key: 'autoFix', icon: <MdAutoFixHigh key="autoFix" />, name: '自动修复' },
  { key: 'microsoft', icon: <TiVendorMicrosoft key="microsoft" />, name: '微软' },
  { key: 'apple', icon: <TiVendorApple key="apple" />, name: '苹果' },
  { key: 'android', icon: <TiVendorAndroid key="android" />, name: '安卓' },
  { key: 'chan4', icon: <Si4Chan key="chan4" />, name: '4Chan' },
  { key: 'threeM', icon: <Si3M key="threeM" />, name: '3M' },
  { key: 'huawei', icon: <SiHuawei key="huawei" />, name: '华为' },
  { key: 'figshare', icon: <SiFigshare key="figshare" />, name: 'Figshare' },
  { key: 'fireship', icon: <SiFireship key="fireship" />, name: 'Fireship' },
  { key: 'icinga', icon: <SiIcinga key="icinga" />, name: 'Icinga' },
  { key: 'icq', icon: <SiIcq key="icq" />, name: 'ICQ' },
  { key: 'tracklist', icon: <Si1001Tracklists key="tracklist" />, name: '播放列表' }
];

// 根据头像名称获取对应的React图标
export const getAvatarIcon = (avatarName?: string | null): React.ReactElement => {
  if (!avatarName || !(avatarName in avatarIconMap)) {
    return avatarIconMap.user; // 默认头像
  }
  return avatarIconMap[avatarName as keyof typeof avatarIconMap];
};

// 获取头像选项的key数组
export const getAvatarKeys = (): string[] => {
  return avatarOptions.map(option => option.key);
};

// 根据key获取头像名称
export const getAvatarName = (key: string): string => {
  const option = avatarOptions.find(opt => opt.key === key);
  return option?.name || '用户';
}; 