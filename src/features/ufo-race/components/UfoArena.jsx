import React, { useState, useEffect, useRef } from 'react';
import { UfoCityBackground } from './UfoCityBackground';
import { UfoSaucer } from './UfoSaucer';
import { UfoStudentSprite } from './UfoStudentSprite';
import { UFO_SPEECH_QUOTES } from '../data/defaultUfoData';
import { ufoAudio } from '../utils/ufoAudio';
import { getShortStudentName } from '../utils/nameHelper';

/**
 * UfoArena.jsx - Đấu trường đại lộ 2 chiều & Đĩa bay UFO thế hệ mới:
 * 1. Đĩa bay UFO nhỏ gọn, lượn trái - phải tự nhiên trên cao cách xa học sinh
 * 2. Khi khóa mục tiêu, UFO lướt tới định vị ngay trên đầu học sinh
 * 3. Học sinh phân bổ tự nhiên trên vỉa hè và lòng đường 2 chiều (phối cảnh 3D)
 * 4. Học sinh bị hút thẳng vào cửa khoang UFO theo tọa độ thực tế
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
  const [ufoPos, setUfoPos] = useState({ x: 600, y: 55, tilt: 0 });
  const ufoPosRef = useRef({ x: 600, y: 55, tilt: 0, vx: 0 });

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
        if (ufoPosRef.current.x === 600) {
          ufoPosRef.current.x = w / 2;
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Khởi tạo các học sinh phân bổ trên vỉa hè & 2 làn đường đại lộ (phối cảnh 3D)
  useEffect(() => {
    if (!students || students.length === 0) return;

    const width = containerSize.width || 1200;
    const height = containerSize.height || 700;
    const roadBaseY = height * 0.81;

    // Phân bổ chiều sâu trên vỉa hè (-32px), làn trong (0px, +12px) và làn ngoài (+28px, +40px)
    const LANE_OFFSETS = [-32, -18, 8, 26, -24, 0, 16, 36];
    const POSES = [35, -35, 75, -75, 175, -170, 45, -45, 85, 180];

    const sprites = students.map((std, idx) => {
      const x = 70 + ((idx * 37) % (width - 140));
      const laneOffset = LANE_OFFSETS[idx % LANE_OFFSETS.length];
      const baseY = roadBaseY + laneOffset;
      const vx = (Math.random() > 0.5 ? 1 : -1) * (0.9 + Math.random() * 1.3);

      // Tỉ lệ phối cảnh: người đứng gần camera (ở dưới) hơi to hơn người đứng xa (ở trên)
      const baseScale = 0.94 + ((baseY - (height * 0.75)) / (height * 0.2)) * 0.16;

      return {
        student: std,
        x,
        y: baseY,
        baseY,
        baseScale,
        floatAltitude: 80 + ((idx * 29) % 130), // Độ cao lơ lửng khi có lực hút phi trọng lượng
        floatPose: POSES[idx % POSES.length],
        vx,
        isTargeted: false,
        isAbducted: false,
        isFallen: false,
        speechQuote: null,
        gender: idx % 2 === 0 ? 'male' : 'female',
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

  // Luồng bong bóng thoại học đường khi đang chơi vui vẻ bình thường
  useEffect(() => {
    const speechTimer = setInterval(() => {
      if (isRunningRef.current) return;
      setStudentSprites(prev => {
        if (prev.length === 0) return prev;
        const randomIdx = Math.floor(Math.random() * prev.length);
        const quotes = [
          'Hôm nay trời đẹp ghê!',
          'Tối qua cày phim tới 2h sáng đuối ghê!',
          'Điện thoại mới mua chụp hình nét ghê!',
          'Hết tiết này đi uống trà sữa không?',
          'Vừa ăn bánh mì giòn ngon xỉu!',
          'Hôm nay chắc không gọi tên mình đâu hihi!',
          'Cơm tấm sườn bì chả thơm nức mũi!'
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        return prev.map((s, idx) => {
          if (idx === randomIdx) {
            return { ...s, speechQuote: randomQuote };
          }
          return s.speechQuote ? { ...s, speechQuote: null } : s;
        });
      });
    }, 4000);

    return () => clearInterval(speechTimer);
  }, []);

  // Vòng lặp vật lý chính: Chuyển động học sinh & Di chuyển tuần tra trái - phải của UFO
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const width = containerSize.width || 1200;

      // 1. CẬP NHẬT CHUYỂN ĐỘNG CỦA ĐĨA BAY UFO (LƯỢN TRÁI PHẢI TRÊN CAO)
      const currentUfo = ufoPosRef.current;
      if (isUfoVisibleRef.current) {
        let targetX;
        if (targetStudentPosRef.current) {
          // Khi đang khóa học sinh mục tiêu: UFO lướt nhanh tới đứng ngay phía trên học sinh
          targetX = targetStudentPosRef.current.x;
        } else {
          // Khi đang tuần tra tìm kiếm: UFO lượn qua lượn lại trái phải tự nhiên
          const patrolRange = width * 0.35;
          targetX = (width / 2) + Math.sin(currentTime * 0.00085) * patrolRange;
        }

        const dx = targetX - currentUfo.x;
        const newVx = dx * Math.min(3.8 * dt, 0.14);
        currentUfo.x += newVx;
        currentUfo.vx = newVx;

        // Nghiêng nhẹ đĩa bay theo hướng bay (banking tilt)
        const targetTilt = Math.max(-10, Math.min(10, newVx * 1.6));
        currentUfo.tilt += (targetTilt - currentUfo.tilt) * Math.min(5.5 * dt, 0.2);

        // Dao động nhấp nhô bồng bềnh ở trên cao (y: 50px - 62px)
        currentUfo.y = 56 + Math.sin(currentTime * 0.002) * 6;
      } else {
        // Khi chưa xuất hiện: bay lên khỏi màn hình
        currentUfo.y = -100;
        currentUfo.x = width / 2;
        currentUfo.tilt = 0;
      }

      setUfoPos({
        x: currentUfo.x,
        y: currentUfo.y,
        tilt: currentUfo.tilt
      });

      // 2. CẬP NHẬT CHUYỂN ĐỘNG CỦA TỪNG HỌC SINH TRÊN ĐẠI LỘ
      setStudentSprites(prev => {
        const ufoCenterX = currentUfo.x;

        const updated = prev.map(item => {
          if (item.isAbducted) return item;

          // Khi bị tia sáng UFO khóa mục tiêu: Đứng im tại chỗ, run sợ quỳ lạy
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

          if (isUfoVisibleRef.current) {
            // SỨC HÚT PHI TRỌNG LỰC NHẤC BỔNG TOÀN BỘ HS LÊN KHÔNG TRUNG LƠ LỬNG
            const targetY = item.baseY - item.floatAltitude + Math.sin(currentTime * 0.0025 + item.x) * 6;
            const targetRotation = item.floatPose + Math.sin(currentTime * 0.002 + item.x) * 4;

            // Lực hút kéo nhẹ về phía tâm đĩa bay đang bay
            const distToUfo = ufoCenterX - item.x;
            const gravityPull = Math.sign(distToUfo) * 18 * dt;

            newX += (item.vx * 28 * dt) + gravityPull;
            newY += (targetY - item.y) * Math.min(2.8 * dt, 0.2);
            newRotation += (targetRotation - item.rotation) * Math.min(3.2 * dt, 0.2);
          } else {
            // TRẢ HỌC SINH VỀ MẶT ĐẤT BƯỚC ĐI BÌNH THƯỜNG TRÊN ĐẠI LỘ
            const targetY = item.baseY;
            const targetRotation = 0;

            newX += item.vx * 35 * dt;
            newY += (targetY - item.y) * Math.min(4.5 * dt, 0.25);
            newRotation += (targetRotation - item.rotation) * Math.min(5.0 * dt, 0.25);
          }

          // Chạm mép đại lộ thì quay đầu
          if (newX < 60) {
            newX = 60;
            newVx = Math.abs(newVx);
          } else if (newX > width - 60) {
            newX = width - 60;
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

    // Chọn ngẫu nhiên X bạn (ưu tiên bạn chưa được gọi)
    let uncalled = availableStudents.filter(s => !calledStudentIds.includes(s.student.id));
    if (uncalled.length < pickCount) {
      uncalled = [...availableStudents];
    }
    const shuffled = [...uncalled].sort(() => Math.random() - 0.5);
    const toCapture = shuffled.slice(0, Math.min(pickCount, shuffled.length));

    // Đếm ngược 15 giây
    setCountdownSeconds(15);
    const countTimer = setInterval(() => {
      setCountdownSeconds(prev => (prev !== null && prev > 1 ? prev - 1 : 0));
    }, 1000);

    // BƯỚC 1: ĐĨA BAY XUẤT HIỆN TỪ VŨ TRỤ (0s - 2.5s)
    setIsUfoVisible(true);
    ufoAudio.playUfoDescent();
    setShowDustClouds(true);
    ufoAudio.playDustBlast();
    const dustTimer = setTimeout(() => setShowDustClouds(false), 2400);

    // BƯỚC 2: BẬT TIA HÚT VÀ CƠN BÃO TRỌNG LỰC NGHIÊNG NGẢ (2.5s - 8.5s)
    const beamTimeout = setTimeout(() => {
      setIsBeaming(true);
      ufoAudio.playTractorBeam();

      // Khiến các học sinh nghiêng ngả, hoảng hốt
      setStudentSprites(prev =>
        prev.map((s, idx) => {
          const isFallen = idx % 4 === 0;
          const quotes = [
            'Cứu tui với!! Gió hút mạnh quá!!',
            'Đừng bắt em mà đĩa bay ơi!!',
            'Sao Hỏa lạnh lắm tha cho em đi!',
            'Thầy ơi em hứa mai học bài đầy đủ!!',
            'Trời ơi ai giật tui ngã vậy nè?!'
          ];
          return {
            ...s,
            isFallen,
            rotation: isFallen ? (s.vx > 0 ? 65 : -65) : (s.vx > 0 ? 35 : -35),
            speechQuote: idx % 3 === 0 ? quotes[idx % quotes.length] : null
          };
        })
      );

      // Radar quét tìm mục tiêu
      const radarPing1 = setTimeout(() => ufoAudio.playRadarSweep(), 1500);
      const radarPing2 = setTimeout(() => ufoAudio.playRadarSweep(), 3500);

      // BƯỚC 3: KHÓA TIA LASER VÀ ĐĨA BAY LƯỚT TỚI MỤC TIÊU (8.5s - 11.5s)
      const lockTimeout = setTimeout(() => {
        const firstTarget = toCapture[0];
        if (!firstTarget) return;

        const liveSprites = studentSpritesRef.current || [];
        const currentTarget = liveSprites.find(s => s.student.id === firstTarget.student.id);
        const lockX = currentTarget ? currentTarget.x : (containerSize.width / 2);
        const lockY = currentTarget ? currentTarget.y : (containerSize.height * 0.81);

        setTargetStudentPos({ x: lockX, y: lockY });
        ufoAudio.playLockOn();

        // Học sinh được chọn đứng yên quỳ lạy xin tha
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

        // BƯỚC 4: HÚT THẲNG LÊN CỬA KHOANG ĐĨA BAY (11.5s - 14.5s)
        const abductTimeout = setTimeout(() => {
          ufoAudio.playAbductWhoosh();
          ufoAudio.playFunnyScream();

          // Kéo bạn thứ nhất bay dọc thẳng vào tâm đĩa bay tại tọa độ thực tế của UFO
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

          // Nếu cần bắt thêm bạn thứ 2 (nếu pickCount >= 2)
          if (toCapture.length > 1) {
            const secondTarget = toCapture[1];
            setTimeout(() => {
              const liveSprites2 = studentSpritesRef.current || [];
              const currentSecond = liveSprites2.find(s => s.student.id === secondTarget.student.id);
              const lock2X = currentSecond ? currentSecond.x : (containerSize.width / 2);
              const lock2Y = currentSecond ? currentSecond.y : (containerSize.height * 0.81);

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

          // BƯỚC 5: KẾT THÚC VÀ CÔNG BỐ CHIẾN THẮNG (Khoảng 15 giây)
          const finishTimeout = setTimeout(() => {
            setIsBeaming(false);
            setTargetStudentPos(null);
            setIsUfoVisible(false);
            ufoAudio.playVictory();

            // Các bạn học sinh còn lại hạ cánh an toàn xuống đất và reo mừng
            setStudentSprites(prev =>
              prev.map(s => {
                if (s.isAbducted) return s;
                return {
                  ...s,
                  speechQuote: Math.random() > 0.5 ? 'May quá đĩa bay đi rồi!' : 'Hura đáp đất an toàn rồi!'
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

  // Sắp xếp các học sinh theo tọa độ Y để bạn nào đứng gần (ở dưới) sẽ che bạn đứng xa (ở trên) chuẩn 3D
  const sortedSprites = [...studentSprites].sort((a, b) => a.y - b.y);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#050a18]"
    >
      {/* 1. Nền thành phố, các gian hàng chân thực & Đại lộ 2 chiều rộng lớn */}
      <UfoCityBackground />

      {/* Hiệu ứng khói bụi cuộn sang hai bên khi đĩa bay sà xuống */}
      {showDustClouds && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-4xl flex justify-between pointer-events-none z-25 px-8">
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

      {/* 2. Đĩa bay UFO thu nhỏ gọn gàng, bay lượn trên cao cách xa học sinh bên dưới */}
      <UfoSaucer
        capturedCount={capturedCount}
        targetCount={pickCount}
        isVisible={isUfoVisible}
        isBeaming={isBeaming}
        targetStudentPos={targetStudentPos}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
        countdownSeconds={countdownSeconds}
        ufoX={ufoPos.x}
        ufoY={ufoPos.y}
        ufoTilt={ufoPos.tilt}
      />

      {/* 3. Toàn bộ học sinh đi lại, chạy nhảy, vui chơi trên đại lộ 2 chiều và vỉa hè (xếp tầng theo chiều sâu) */}
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
