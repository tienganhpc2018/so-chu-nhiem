import React, { useState, useEffect, useRef } from 'react';
import { UfoCityBackground } from './UfoCityBackground';
import { UfoSaucer } from './UfoSaucer';
import { UfoStudentSprite } from './UfoStudentSprite';
import { UFO_SPEECH_QUOTES } from '../data/defaultUfoData';
import { ufoAudio } from '../utils/ufoAudio';
import { getShortStudentName } from '../utils/nameHelper';

/**
 * UfoArena.jsx - Đấu trường đường phố chân thực theo ảnh tham chiếu:
 * 1. Nền ảnh phố cổ Hội An hoàng hôn bên sông tuyệt đẹp
 * 2. Đĩa bay UFO tím vòm kính xanh cyan di chuyển tuần tra lượn trái - phải trên bầu trời
 * 3. Khi giáo viên bấm Bắt đầu: UFO bay đến rà tìm, khóa tia laser vàng và phóng cột hút đón học sinh
 * 4. Học sinh đồng phục áo trắng khăn quàng đỏ đi lại tự nhiên trên vỉa hè
 * 5. Có xe buýt trường học vàng và ô tô chạy 2 chiều
 */

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

  // Trạng thái tọa độ & góc nghiêng thời gian thực của UFO khi bay lượn
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

  // Khởi tạo các học sinh phân bổ trên vỉa hè rộng rãi (độ cao y từ 60% đến 78% màn hình)
  useEffect(() => {
    if (!students || students.length === 0) return;

    const width = containerSize.width || 1200;
    const height = containerSize.height || 700;

    // Vỉa hè đi bộ nằm ở khoảng 62% - 74% chiều cao màn hình như ảnh mẫu
    const sidewalkBaseY = height * 0.68;
    const SIDEWALK_OFFSETS = [-35, -20, -5, 12, 28, -28, -12, 5, 22, 36];
    const POSES = [35, -35, 75, -75, 175, -170, 45, -45, 85, 180];

    const sprites = students.map((std, idx) => {
      // Phân bổ trải dài trên vỉa hè từ trái qua phải (chừa lề 2 bên)
      const x = 80 + ((idx * 43) % (width - 160));
      const laneOffset = SIDEWALK_OFFSETS[idx % SIDEWALK_OFFSETS.length];
      const baseY = sidewalkBaseY + laneOffset;
      const vx = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 1.2);

      // Phối cảnh 3D: Bạn đứng gần mép dưới to hơn một chút
      const baseScale = 0.95 + ((baseY - (height * 0.62)) / (height * 0.18)) * 0.18;

      return {
        student: std,
        x,
        y: baseY,
        baseY,
        baseScale,
        floatAltitude: 80 + ((idx * 29) % 130),
        floatPose: POSES[idx % POSES.length],
        vx,
        isTargeted: false,
        isAbducted: false,
        isFallen: false,
        speechQuote: null,
        gender: idx % 2 === 0 ? 'female' : 'male',
        rotation: 0,
        opacity: 1,
        scale: baseScale
      };
    });

    setStudentSprites(sprites);
    setCapturedCount(0);
    setTargetStudentPos(null);
    setIsBeaming(false);
    setIsUfoVisible(false);
    setCountdownSeconds(null);
  }, [students, containerSize.width, containerSize.height]);

  // Luồng bong bóng thoại học đường
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
          'Vừa uống trà sữa trân châu ngon xỉu!',
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

  // Vòng lặp vật lý chính: UFO bay lượn trái phải trên bầu trời hoàng hôn & Học sinh di chuyển
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const width = containerSize.width || 1200;

      // 1. CẬP NHẬT CHUYỂN ĐỘNG CỦA ĐĨA BAY UFO
      const currentUfo = ufoPosRef.current;
      if (isUfoVisibleRef.current) {
        let targetX;
        if (targetStudentPosRef.current) {
          // Khi đang khóa mục tiêu: UFO bay đến định vị phía trên học sinh
          targetX = targetStudentPosRef.current.x;
        } else {
          // Tuần tra lượn trái - phải trên bầu trời phía trên dãy nhà cổ
          const centerPos = width * 0.42;
          const patrolRange = width * 0.32;
          targetX = centerPos + Math.sin(currentTime * 0.0009) * patrolRange;
        }

        const dx = targetX - currentUfo.x;
        const newVx = dx * Math.min(3.6 * dt, 0.14);
        currentUfo.x += newVx;
        currentUfo.vx = newVx;

        // Nghiêng nhẹ góc đĩa bay theo hướng lướt
        const targetTilt = Math.max(-10, Math.min(10, newVx * 1.5));
        currentUfo.tilt += (targetTilt - currentUfo.tilt) * Math.min(5.5 * dt, 0.2);

        // Nhấp nhô bồng bềnh ở độ cao 80px - 120px trên bầu trời
        currentUfo.y = 105 + Math.sin(currentTime * 0.002) * 8;
      } else {
        // Khi chưa xuất hiện hoặc ẩn: bay ở vị trí như trong ảnh mẫu (x: 38% chiều rộng, y: 110px)
        currentUfo.x = width * 0.38;
        currentUfo.y = 105 + Math.sin(currentTime * 0.0018) * 5;
        currentUfo.tilt = Math.sin(currentTime * 0.0015) * 3;
      }

      setUfoPos({
        x: currentUfo.x,
        y: currentUfo.y,
        tilt: currentUfo.tilt
      });

      // 2. CẬP NHẬT CHUYỂN ĐỘNG CỦA HỌC SINH TRÊN VỈA HÈ
      setStudentSprites(prev => {
        const ufoCenterX = currentUfo.x;

        const updated = prev.map(item => {
          if (item.isAbducted) return item;

          if (item.isTargeted) {
            return {
              ...item,
              rotation: Math.sin(currentTime * 0.03) * 12
            };
          }

          let newX = item.x;
          let newY = item.y;
          let newVx = item.vx;
          let newRotation = item.rotation;

          if (isUfoVisibleRef.current && isBeaming) {
            // Lực hút nâng nhẹ học sinh lơ lửng
            const targetY = item.baseY - item.floatAltitude + Math.sin(currentTime * 0.0025 + item.x) * 6;
            const targetRotation = item.floatPose + Math.sin(currentTime * 0.002 + item.x) * 4;

            const distToUfo = ufoCenterX - item.x;
            const gravityPull = Math.sign(distToUfo) * 18 * dt;

            newX += (item.vx * 26 * dt) + gravityPull;
            newY += (targetY - item.y) * Math.min(2.8 * dt, 0.2);
            newRotation += (targetRotation - item.rotation) * Math.min(3.2 * dt, 0.2);
          } else {
            // Đi bộ qua lại bình thường trên vỉa hè
            const targetY = item.baseY;
            const targetRotation = 0;

            newX += item.vx * 32 * dt;
            newY += (targetY - item.y) * Math.min(4.5 * dt, 0.25);
            newRotation += (targetRotation - item.rotation) * Math.min(5.0 * dt, 0.25);
          }

          // Chạm mép vỉa hè thì quay đầu
          if (newX < 70) {
            newX = 70;
            newVx = Math.abs(newVx);
          } else if (newX > width - 70) {
            newX = width - 70;
            newVx = -Math.abs(newVx);
          }

          return {
            ...item,
            x: newX,
            y: newY,
            vx: newVx,
            rotation: newRotation
          };
        });

        studentSpritesRef.current = updated;
        return updated;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [containerSize.width, isBeaming]);

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

    // BƯỚC 1: ĐĨA BAY SÀ XUỐNG
    setIsUfoVisible(true);
    ufoAudio.playUfoDescent();
    setShowDustClouds(true);
    ufoAudio.playDustBlast();
    const dustTimer = setTimeout(() => setShowDustClouds(false), 2400);

    // BƯỚC 2: BẬT TIA HÚT VÀ CƠN BÃO TRỌNG LỰC
    const beamTimeout = setTimeout(() => {
      setIsBeaming(true);
      ufoAudio.playTractorBeam();

      setStudentSprites(prev =>
        prev.map((s, idx) => {
          const isFallen = idx % 4 === 0;
          const quotes = [
            'Cứu tui với!! Gió hút mạnh quá!!',
            'Đừng bắt em mà đĩa bay ơi!!',
            'Thầy ơi em hứa mai học bài đầy đủ!!',
            'Trời ơi đĩa bay sà xuống rồi!!'
          ];
          return {
            ...s,
            isFallen,
            rotation: isFallen ? (s.vx > 0 ? 65 : -65) : (s.vx > 0 ? 35 : -35),
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
        const lockY = currentTarget ? currentTarget.y : (containerSize.height * 0.68);

        setTargetStudentPos({ x: lockX, y: lockY });
        ufoAudio.playLockOn();

        setStudentSprites(prev =>
          prev.map(s => {
            if (s.student.id === firstTarget.student.id) {
              return {
                ...s,
                x: lockX,
                y: lockY,
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

        // BƯỚC 4: HÚT THẲNG LÊN CỬA KHOANG ĐĨA BAY
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
              const lock2Y = currentSecond ? currentSecond.y : (containerSize.height * 0.68);

              setTargetStudentPos({ x: lock2X, y: lock2Y });
              ufoAudio.playLockOn();
              setStudentSprites(prev =>
                prev.map(s =>
                  s.student.id === secondTarget.student.id
                    ? { ...s, isTargeted: true, x: lock2X, y: lock2Y, speechQuote: 'Cứu em với thầy ơi!! 🙏' }
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

  // Sắp xếp các học sinh theo tọa độ Y để bạn nào đứng gần (ở dưới) sẽ che bạn đứng xa
  const sortedSprites = [...studentSprites].sort((a, b) => a.y - b.y);

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
        isVisible={true} /* UFO luôn xuất hiện bay lơ lửng trên bầu trời như trong ảnh */
        isBeaming={isBeaming}
        targetStudentPos={targetStudentPos}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
        countdownSeconds={countdownSeconds}
        ufoX={ufoPos.x}
        ufoY={ufoPos.y}
        ufoTilt={ufoPos.tilt}
      />

      {/* 3. Toàn bộ học sinh đi lại, đứng chơi trên vỉa hè theo chiều sâu 3D */}
      {sortedSprites.map(item => (
        <UfoStudentSprite
          key={item.student.id}
          student={item.student}
          allStudents={students}
          x={item.x}
          y={item.y}
          vx={item.vx}
          isTargeted={item.isTargeted}
          isAbducted={item.isAbducted}
          isFallen={item.isFallen}
          speechQuote={item.speechQuote}
          gender={item.gender}
          rotation={item.rotation}
          opacity={item.opacity}
          scale={item.scale}
        />
      ))}
    </div>
  );
};
