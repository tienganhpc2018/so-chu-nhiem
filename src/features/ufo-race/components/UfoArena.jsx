import React, { useState, useEffect, useRef } from 'react';
import { UfoCityBackground } from './UfoCityBackground';
import { UfoSaucer } from './UfoSaucer';
import { UfoStudentSprite } from './UfoStudentSprite';
import { UFO_SPEECH_QUOTES } from '../data/defaultUfoData';
import { ufoAudio } from '../utils/ufoAudio';
import { getShortStudentName } from '../utils/nameHelper';

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

  const animFrameRef = useRef(null);
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;
  const isUfoVisibleRef = useRef(isUfoVisible);
  isUfoVisibleRef.current = isUfoVisible;
  const studentSpritesRef = useRef(studentSprites);
  studentSpritesRef.current = studentSprites;

  // Lấy kích thước container responsive
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth || 1200,
          height: containerRef.current.clientHeight || 700
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Khởi tạo các học sinh với độ cao lơ lửng và tư thế nghiêng ngả đa dạng
  useEffect(() => {
    if (!students || students.length === 0) return;

    const width = containerSize.width || 1200;
    const height = containerSize.height || 700;
    const roadY = height * 0.84;

    const POSES = [35, -35, 75, -75, 175, -170, 45, -45, 85, 180];
    const sprites = students.map((std, idx) => {
      const x = 70 + ((idx * 37) % (width - 140));
      const vx = (Math.random() > 0.5 ? 1 : -1) * (0.9 + Math.random() * 1.3);
      return {
        student: std,
        x,
        y: roadY,
        baseY: roadY,
        floatAltitude: 80 + ((idx * 29) % 130), // Độ cao lơ lửng 80px - 210px khỏi mặt đất
        floatPose: POSES[idx % POSES.length], // Tư thế: nghiêng, ngã nằm ngang, lộn ngược
        vx,
        isTargeted: false,
        isAbducted: false,
        isFallen: false,
        speechQuote: null,
        gender: idx % 2 === 0 ? 'male' : 'female',
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
          'Vừa ăn bánh mì ngon xỉu!',
          'Hôm nay chắc không gọi tên mình đâu hihi!',
          'Ngồi nói chuyện xíu có ai thấy đâu!'
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

  // Vòng lặp vật lý: chuyển động chạy, nghiêng ngã, nhào lộn theo sức hút UFO
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      setStudentSprites(prev => {
        const width = containerSize.width || 1200;
        const centerX = width / 2;

        const updated = prev.map(item => {
          if (item.isAbducted) return item;

          // Khi bị tia sáng UFO khóa mục tiêu: Đứng im tại vị trí khóa, quỳ lạy run sợ, không chạy đi đâu
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
            // KHI ĐĨA BAY XUẤT HIỆN: SỨC HÚT PHI TRỌNG LỰC NHẤC BỔNG TOÀN BỘ HS LÊN KHÔNG TRUNG LƠ LỬNG
            const targetY = item.baseY - item.floatAltitude + Math.sin(currentTime * 0.0025 + item.x) * 6;
            const targetRotation = item.floatPose + Math.sin(currentTime * 0.002 + item.x) * 4;

            // Lực hút kéo nhẹ về phía tâm đĩa bay
            const distToCenter = centerX - item.x;
            const gravityPull = Math.sign(distToCenter) * 20 * dt;

            // Trôi dạt chậm rãi trong trạng thái không trọng lượng
            newX += (item.vx * 30 * dt) + gravityPull;

            // Bay bổng mượt mà lên không trung
            newY += (targetY - item.y) * Math.min(2.8 * dt, 0.2);
            newRotation += (targetRotation - item.rotation) * Math.min(3.2 * dt, 0.2);
          } else {
            // KHI CHƯA CÓ ĐĨA BAY HOẶC ĐĨA BAY BẮT XONG ĐÃ BIẾN MẤT: TRẢ TOÀN BỘ HỌC SINH VỀ MẶT ĐẤT
            const targetY = item.baseY;
            const targetRotation = 0; // Đứng thẳng người bình thường

            newX += item.vx * 35 * dt;

            // Hạ cánh êm ái trở lại mặt đất
            newY += (targetY - item.y) * Math.min(4.5 * dt, 0.25);
            newRotation += (targetRotation - item.rotation) * Math.min(5.0 * dt, 0.25);
          }

          // Chạm mép thành phố thì quay đầu
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

  // Kịch bản hồi hộp 15 giây khi giáo viên bấm Bắt đầu (Đúng yêu cầu Thầy)
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

      // Khiến các học sinh nghiêng ngả, ngã nhào lộn vì lực hút
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

      // BƯỚC 3: KHÓA TIA LASER ĐỎ VÀO MỤC TIÊU HỒI HỘP (8.5s - 11.5s)
      const lockTimeout = setTimeout(() => {
        const firstTarget = toCapture[0];
        if (!firstTarget) return;

        // Bắt chính xác tọa độ THỰC TẾ trực tiếp tại thời điểm này từ studentSpritesRef
        const liveSprites = studentSpritesRef.current || [];
        const currentTarget = liveSprites.find(s => s.student.id === firstTarget.student.id);
        const lockX = currentTarget ? currentTarget.x : (containerSize.width / 2);
        const lockY = currentTarget ? currentTarget.y : (containerSize.height * 0.84);

        // Khóa luồng tia sáng đĩa bay thẳng vào đúng vị trí học sinh đang đứng
        setTargetStudentPos({ x: lockX, y: lockY });
        ufoAudio.playLockOn();

        // Học sinh được chọn đứng yên quỳ lạy xin tha ngay tâm tia sáng
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

        // BƯỚC 4: HÚT NHÀO LỘN BAY DỌC THẲNG THEO TIA SÁNG VÀO TRONG KHOANG ĐĨA BAY (11.5s - 14.5s)
        const abductTimeout = setTimeout(() => {
          ufoAudio.playAbductWhoosh();
          ufoAudio.playFunnyScream(); // Tiếng hét thất thanh "Á á á cứu em!"

          // Kéo bạn thứ nhất bay dọc thẳng vào tâm cửa khoang đĩa bay
          setStudentSprites(prev =>
            prev.map(s => {
              if (s.student.id === firstTarget.student.id) {
                return {
                  ...s,
                  isTargeted: false,
                  isAbducted: true,
                  x: containerSize.width / 2, // Đỉnh nón tia sáng (cửa đáy UFO)
                  y: 135, // Cửa khoang đáy đĩa bay
                  rotation: 720, // Nhào lộn tròn
                  scale: 0.1, // Thu nhỏ vào trong khoang
                  opacity: 0 // Biến mất hoàn toàn vào trong UFO
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
              const lock2Y = currentSecond ? currentSecond.y : (containerSize.height * 0.84);

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
                        x: containerSize.width / 2,
                        y: 135,
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
            setIsUfoVisible(false); // UFO biến mất -> Học sinh hạ cánh êm dịu trở về mặt đất!
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

              // Đã xóa giọng đọc máy tính Web Speech API theo đúng yêu cầu của Thầy
              onCompleteCapture?.(capturedFinal);
            }, 1800); // Đợi 1.8s để học sinh hạ cánh hoàn toàn xuống đất rồi mới mở bảng kết quả
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
      className="relative w-full h-full overflow-hidden select-none bg-[#0a1128]"
    >
      {/* 1. Nền thành phố & Bầu trời đêm */}
      <UfoCityBackground />

      {/* Hiệu ứng khói bụi trắng bốc lên cuộn sang hai bên mặt đường khi đĩa bay sà xuống */}
      {showDustClouds && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-4xl flex justify-between pointer-events-none z-25 px-8">
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

      {/* 2. Đĩa bay UFO xuất hiện từ trên cao, đồng hồ đếm ngược và cửa khoang */}
      <UfoSaucer
        capturedCount={capturedCount}
        targetCount={pickCount}
        isVisible={isUfoVisible}
        isBeaming={isBeaming}
        targetStudentPos={targetStudentPos}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
        countdownSeconds={countdownSeconds}
      />

      {/* 3. Toàn bộ học sinh chạy nhảy, nghiêng ngả, nhào lộn trên phố */}
      {studentSprites.map(item => (
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
