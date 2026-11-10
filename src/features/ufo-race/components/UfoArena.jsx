import React, { useState, useEffect, useRef } from 'react';
import { UfoCityBackground } from './UfoCityBackground';
import { UfoSaucer } from './UfoSaucer';
import { UfoStudentSprite } from './UfoStudentSprite';
import { UFO_SPEECH_QUOTES } from '../data/defaultUfoData';
import { ufoAudio } from '../utils/ufoAudio';
import { getShortStudentName } from '../utils/nameHelper';

/**
 * Tọa độ 19 vị trí học sinh chuẩn xác trên bức ảnh gốc của Thầy:
 * Tọa độ tính theo tỷ lệ phần trăm { xPct, yPct, badgeNumber, originalGender }:
 * Trải dài từ bên trái sang bên phải trên vỉa hè phố cổ.
 */
const ORIGINAL_STUDENT_SPOTS = [
  { xPct: 0.075, yPct: 0.585, badge: 17, gender: 'female' }, // Bạn gái số 17 bên trái
  { xPct: 0.100, yPct: 0.655, badge: 15, gender: 'female' }, // Bạn gái số 15
  { xPct: 0.170, yPct: 0.630, badge: 5,  gender: 'male'   }, // Bạn nam số 5
  { xPct: 0.228, yPct: 0.655, badge: 12, gender: 'male'   }, // Bạn nam số 12
  { xPct: 0.340, yPct: 0.555, badge: 16, gender: 'male'   }, // Bạn nam đứng sau cửa hàng
  { xPct: 0.370, yPct: 0.650, badge: 11, gender: 'female' }, // Bạn gái số 11
  { xPct: 0.408, yPct: 0.705, badge: 18, gender: 'male'   }, // Bạn nam số 18
  { xPct: 0.448, yPct: 0.700, badge: 9,  gender: 'female' }, // Bạn gái số 9
  { xPct: 0.450, yPct: 0.620, badge: 14, gender: 'male'   }, // Bạn nam số 14
  { xPct: 0.490, yPct: 0.595, badge: 4,  gender: 'female' }, // Bạn gái số 4
  { xPct: 0.540, yPct: 0.645, badge: 2,  gender: 'female' }, // Bạn gái số 2
  { xPct: 0.575, yPct: 0.640, badge: 7,  gender: 'male'   }, // Bạn nam số 7
  { xPct: 0.560, yPct: 0.565, badge: 13, gender: 'female' }, // Bạn gái số 13
  { xPct: 0.580, yPct: 0.560, badge: 6,  gender: 'female' }, // Bạn gái số 6
  { xPct: 0.758, yPct: 0.635, badge: 3,  gender: 'male'   }, // Bạn nam số 3
  { xPct: 0.875, yPct: 0.655, badge: 19, gender: 'female' }, // Bạn gái số 19
  { xPct: 0.902, yPct: 0.700, badge: 10, gender: 'male'   }, // Bạn nam số 10
  { xPct: 0.922, yPct: 0.625, badge: 1,  gender: 'male'   }, // Bạn nam số 1
  // Vị trí bổ sung nhẹ nhàng trên vỉa hè nếu lớp có nhiều hơn 18 học sinh
  { xPct: 0.285, yPct: 0.630, badge: 8,  gender: 'female' },
  { xPct: 0.650, yPct: 0.620, badge: 20, gender: 'male'   },
  { xPct: 0.700, yPct: 0.630, badge: 21, gender: 'female' },
  { xPct: 0.820, yPct: 0.640, badge: 22, gender: 'male'   },
  { xPct: 0.135, yPct: 0.640, badge: 23, gender: 'female' },
  { xPct: 0.480, yPct: 0.670, badge: 24, gender: 'male'   }
];

export const UfoArena = ({
  students = [],
  pickCount = 2,
  isRunning = false,
  onCompleteCapture,
  calledStudentIds = []
}) => {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 700 });
  const [studentSprites, setStudentSprites] = useState([]);
  const [capturedCount, setCapturedCount] = useState(0);
  const [targetStudentPos, setTargetStudentPos] = useState(null);
  const [isBeaming, setIsBeaming] = useState(false);
  const [isUfoVisible, setIsUfoVisible] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(null);
  const [showDustClouds, setShowDustClouds] = useState(false);

  // Tọa độ và góc nghiêng của UFO
  const [ufoPos, setUfoPos] = useState({ x: 420, y: 110, tilt: 0 });
  const ufoPosRef = useRef({ x: 420, y: 110, tilt: 0, vx: 0 });

  const animFrameRef = useRef(null);
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;
  const isUfoVisibleRef = useRef(isUfoVisible);
  isUfoVisibleRef.current = isUfoVisible;
  const studentSpritesRef = useRef(studentSprites);
  studentSpritesRef.current = studentSprites;
  const targetStudentPosRef = useRef(targetStudentPos);
  targetStudentPosRef.current = targetStudentPos;

  // Lấy kích thước container responsive
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || 1200;
        const h = containerRef.current.clientHeight || 700;
        setContainerSize({ width: w, height: h });
        if (ufoPosRef.current.x === 420) {
          ufoPosRef.current.x = w * 0.38;
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // GẮN TỪNG HỌC SINH CỦA LỚP TRỰC TIẾP VÀO TỪNG VỊ TRÍ TRÊN ẢNH NỀN GỐC
  useEffect(() => {
    if (!students || students.length === 0) return;

    const width = containerSize.width || 1200;
    const height = containerSize.height || 700;

    const sprites = students.map((std, idx) => {
      const spot = ORIGINAL_STUDENT_SPOTS[idx % ORIGINAL_STUDENT_SPOTS.length];
      const x = spot.xPct * width;
      const y = spot.yPct * height;

      return {
        student: std,
        x,
        y,
        baseY: y,
        badgeNumber: spot.badge,
        gender: spot.gender,
        isTargeted: false,
        isAbducted: false,
        isFallen: false,
        speechQuote: null,
        rotation: 0,
        opacity: 1,
        scale: 1
      };
    });

    setStudentSprites(sprites);
    setCapturedCount(0);
    setTargetStudentPos(null);
    setIsBeaming(false);
    setIsUfoVisible(false);
    setCountdownSeconds(null);
  }, [students, containerSize.width, containerSize.height]);

  // Luồng bong bóng thoại học đường vui nhộn
  useEffect(() => {
    const speechTimer = setInterval(() => {
      if (isRunningRef.current) return;
      setStudentSprites(prev => {
        if (prev.length === 0) return prev;
        const randomIdx = Math.floor(Math.random() * prev.length);
        const quotes = [
          'Hôm nay trời đẹp ghê!',
          'Trời hoàng hôn trên phố đẹp quá!',
          'Hết tiết này đi ăn kem không?',
          'Vừa uống trà sữa ngon xỉu!',
          'Hôm nay chắc không gọi tên mình đâu hihi!',
          'Xe buýt sắp tới đón rồi kìa!'
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        return prev.map((s, idx) => {
          if (idx === randomIdx) {
            return { ...s, speechQuote: randomQuote };
          }
          return s.speechQuote ? { ...s, speechQuote: null } : s;
        });
      });
    }, 4500);

    return () => clearInterval(speechTimer);
  }, []);

  // Vòng lặp vật lý chính: UFO bay lượn trái - phải trên bầu trời
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const width = containerSize.width || 1200;

      // CẬP NHẬT CHUYỂN ĐỘNG CỦA ĐĨA BAY UFO
      const currentUfo = ufoPosRef.current;
      if (isUfoVisibleRef.current) {
        let targetX;
        if (targetStudentPosRef.current) {
          // Khi đang khóa học sinh mục tiêu: UFO lướt nhanh tới đứng ngay phía trên học sinh
          targetX = targetStudentPosRef.current.x;
        } else {
          // Tuần tra lượn trái - phải trên bầu trời phố cổ
          const centerPos = width * 0.42;
          const patrolRange = width * 0.32;
          targetX = centerPos + Math.sin(currentTime * 0.0009) * patrolRange;
        }

        const dx = targetX - currentUfo.x;
        const newVx = dx * Math.min(3.6 * dt, 0.14);
        currentUfo.x += newVx;
        currentUfo.vx = newVx;

        const targetTilt = Math.max(-10, Math.min(10, newVx * 1.5));
        currentUfo.tilt += (targetTilt - currentUfo.tilt) * Math.min(5.5 * dt, 0.2);
        currentUfo.y = 105 + Math.sin(currentTime * 0.002) * 8;
      } else {
        // Vị trí chuẩn như ảnh gốc (x: 38% chiều rộng, y: 105px)
        currentUfo.x = width * 0.38;
        currentUfo.y = 105 + Math.sin(currentTime * 0.0018) * 5;
        currentUfo.tilt = Math.sin(currentTime * 0.0015) * 3;
      }

      setUfoPos({
        x: currentUfo.x,
        y: currentUfo.y,
        tilt: currentUfo.tilt
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [containerSize.width]);

  // Kịch bản hồi hộp 15 giây khi giáo viên bấm Bắt đầu
  useEffect(() => {
    if (!isRunning) {
      setIsUfoVisible(false);
      setIsBeaming(false);
      setTargetStudentPos(null);
      setCountdownSeconds(null);
      return;
    }

    const availableStudents = studentSprites.filter(s => !s.isAbducted);
    if (availableStudents.length === 0) return;

    let uncalled = availableStudents.filter(s => !calledStudentIds.includes(s.student.id));
    if (uncalled.length < pickCount) {
      uncalled = [...availableStudents];
    }
    const shuffled = [...uncalled].sort(() => Math.random() - 0.5);
    const toCapture = shuffled.slice(0, Math.min(pickCount, shuffled.length));

    setCountdownSeconds(15);
    const countTimer = setInterval(() => {
      setCountdownSeconds(prev => (prev !== null && prev > 1 ? prev - 1 : 0));
    }, 1000);

    // BƯỚC 1: ĐĨA BAY BẮT ĐẦU TUẦN TRA TÌM KIẾM
    setIsUfoVisible(true);
    ufoAudio.playUfoDescent();
    setShowDustClouds(true);
    ufoAudio.playDustBlast();
    const dustTimer = setTimeout(() => setShowDustClouds(false), 2400);

    // BƯỚC 2: BẬT TIA HÚT VÀ CƠN BÃO HỒI HỘP
    const beamTimeout = setTimeout(() => {
      setIsBeaming(true);
      ufoAudio.playTractorBeam();

      setStudentSprites(prev =>
        prev.map((s, idx) => {
          const quotes = [
            'Cứu tui với!! Đĩa bay đến rồi!!',
            'Đừng bắt em mà đĩa bay ơi!!',
            'Thầy ơi em hứa mai học bài đầy đủ!!',
            'Ai sẽ bị tóm đây hồi hộp quá!!'
          ];
          return {
            ...s,
            speechQuote: idx % 3 === 0 ? quotes[idx % quotes.length] : null
          };
        })
      );

      const radarPing1 = setTimeout(() => ufoAudio.playRadarSweep(), 1500);
      const radarPing2 = setTimeout(() => ufoAudio.playRadarSweep(), 3500);

      // BƯỚC 3: KHÓA TIA LASER VÀO HỌC SINH MỤC TIÊU
      const lockTimeout = setTimeout(() => {
        const firstTarget = toCapture[0];
        if (!firstTarget) return;

        const liveSprites = studentSpritesRef.current || [];
        const currentTarget = liveSprites.find(s => s.student.id === firstTarget.student.id);
        const lockX = currentTarget ? currentTarget.x : (containerSize.width / 2);
        const lockY = currentTarget ? currentTarget.y : (containerSize.height * 0.65);

        setTargetStudentPos({ x: lockX, y: lockY });
        ufoAudio.playLockOn();

        setStudentSprites(prev =>
          prev.map(s => {
            if (s.student.id === firstTarget.student.id) {
              return {
                ...s,
                isTargeted: true,
                speechQuote: 'Con xin thầy tha cho con lần này!! 🙏'
              };
            }
            return {
              ...s,
              speechQuote: s.speechQuote ? null : s.speechQuote
            };
          })
        );

        // BƯỚC 4: HÚT HỌC SINH BAY LÊN ĐĨA BAY
        const abductTimeout = setTimeout(() => {
          ufoAudio.playAbductWhoosh();
          ufoAudio.playFunnyScream();

          setStudentSprites(prev =>
            prev.map(s => {
              if (s.student.id === firstTarget.student.id) {
                return {
                  ...s,
                  isTargeted: false,
                  isAbducted: true,
                  x: ufoPosRef.current.x,
                  y: ufoPosRef.current.y + 20,
                  rotation: 720,
                  scale: 0.1,
                  opacity: 0
                };
              }
              return s;
            })
          );
          setCapturedCount(1);

          // Nếu cần bắt thêm bạn thứ 2
          if (toCapture.length > 1) {
            const secondTarget = toCapture[1];
            setTimeout(() => {
              const liveSprites2 = studentSpritesRef.current || [];
              const currentSecond = liveSprites2.find(s => s.student.id === secondTarget.student.id);
              const lock2X = currentSecond ? currentSecond.x : (containerSize.width / 2);
              const lock2Y = currentSecond ? currentSecond.y : (containerSize.height * 0.65);

              setTargetStudentPos({ x: lock2X, y: lock2Y });
              ufoAudio.playLockOn();
              setStudentSprites(prev =>
                prev.map(s =>
                  s.student.id === secondTarget.student.id
                    ? { ...s, isTargeted: true, speechQuote: 'Cứu em với thầy ơi!! 🙏' }
                    : s
                )
              );

              setTimeout(() => {
                ufoAudio.playAbductWhoosh();
                ufoAudio.playFunnyScream();
                setStudentSprites(prev =>
                  prev.map(s => {
                    if (s.student.id === secondTarget.student.id) {
                      return {
                        ...s,
                        isTargeted: false,
                        isAbducted: true,
                        x: ufoPosRef.current.x,
                        y: ufoPosRef.current.y + 20,
                        rotation: -720,
                        scale: 0.1,
                        opacity: 0
                      };
                    }
                    return s;
                  })
                );
                setCapturedCount(toCapture.length);
              }, 1200);
            }, 800);
          }

          // BƯỚC 5: KẾT THÚC VÀ CÔNG BỐ CHIẾN THẮNG
          const finishTimeout = setTimeout(() => {
            setIsBeaming(false);
            setTargetStudentPos(null);
            setIsUfoVisible(false);
            ufoAudio.playVictory();

            setStudentSprites(prev =>
              prev.map(s => {
                if (s.isAbducted) return s;
                return {
                  ...s,
                  speechQuote: Math.random() > 0.5 ? 'May quá đĩa bay đi rồi!' : 'Hura an toàn rồi!'
                };
              })
            );

            setTimeout(() => {
              clearInterval(countTimer);
              const capturedFinal = toCapture.map(q => ({
                ...q.student,
                shortName: getShortStudentName(q.student.name || q.student.full_name, students)
              }));

              onCompleteCapture?.(capturedFinal);
            }, 1800);
          }, toCapture.length > 1 ? 2600 : 1600);

          return () => clearTimeout(finishTimeout);
        }, 2800);

        return () => clearTimeout(abductTimeout);
      }, 5500);

      return () => {
        clearTimeout(radarPing1);
        clearTimeout(radarPing2);
        clearTimeout(lockTimeout);
      };
    }, 2500);

    return () => {
      clearInterval(countTimer);
      clearTimeout(beamTimeout);
    };
  }, [isRunning, pickCount]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#050a18]"
    >
      {/* 1. Nền thành phố phố cổ hoàng hôn thật 100% như ảnh, vỉa hè & xe cộ chạy */}
      <UfoCityBackground />

      {/* Hiệu ứng khói bụi cuộn sang hai bên khi đĩa bay sà xuống */}
      {showDustClouds && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-full max-w-4xl flex justify-between pointer-events-none z-25 px-8">
          <div className="flex items-center space-x-2 animate-pulse opacity-85">
            <div className="w-20 h-14 rounded-full bg-slate-200/60 blur-md transform -translate-x-6" />
            <div className="w-28 h-16 rounded-full bg-slate-300/40 blur-lg" />
            <div className="w-16 h-12 rounded-full bg-slate-100/70 blur-sm" />
          </div>
          <div className="flex items-center space-x-2 animate-pulse opacity-85">
            <div className="w-16 h-12 rounded-full bg-slate-100/70 blur-sm" />
            <div className="w-28 h-16 rounded-full bg-slate-300/40 blur-lg" />
            <div className="w-20 h-14 rounded-full bg-slate-200/60 blur-md transform translate-x-6" />
          </div>
        </div>
      )}

      {/* 2. Đĩa bay UFO tím vòm kính xanh bay lượn trên cao tuần tra và bắt học sinh */}
      <UfoSaucer
        capturedCount={capturedCount}
        targetCount={pickCount}
        isVisible={true}
        isBeaming={isBeaming}
        targetStudentPos={targetStudentPos}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
        countdownSeconds={countdownSeconds}
        ufoX={ufoPos.x}
        ufoY={ufoPos.y}
        ufoTilt={ufoPos.tilt}
      />

      {/* 3. Tận dụng trực tiếp hình ảnh học sinh trên nền gốc: Chỉ gắn nhãn tên gọn gàng & hiệu ứng khóa hút */}
      {studentSprites.map(item => (
        <UfoStudentSprite
          key={item.student.id}
          student={item.student}
          allStudents={students}
          x={item.x}
          y={item.y}
          vx={0}
          isTargeted={item.isTargeted}
          isAbducted={item.isAbducted}
          isFallen={item.isFallen}
          speechQuote={item.speechQuote}
          gender={item.gender}
          rotation={item.rotation}
          opacity={item.opacity}
          scale={item.scale}
          badgeNumber={item.badgeNumber}
        />
      ))}
    </div>
  );
};
