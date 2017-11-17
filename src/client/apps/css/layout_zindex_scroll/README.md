스크롤에 따른 배경 화면 전환
===

[출처](https://codepen.io/thomasvaeth/pen/xLwwZq)

`position: absolute` 를 주었는데도, scroll height가 계산되는 것은 오늘 알았다.

child element의 높이에 따라 scroll height가 구해진다고 생각했지만, `absolute`를 통해 그려진 아이템을 모두 볼 수 있도록 scroll이 생성되었다.

또 한가지 특이한 점은 원본 작품과 다르게, scoll 이 하단까지 이루어 지면, 다시 `scrollTop`이 `0`으로 재 설정 된다는 점이다. 혹시나 해서, chrome 사용자 버전과, firefox, safari 에서 해봤지만 모두 같은 현상이였다.

우연히 초기 값을 다음과 같이 주었을 때, 정상 동작함을 확인했다. (5be412c)

``` js
                    child.style.top = `${idx * 2}00vh`;
```

일단, `absolute`로도 `scrollHeight`가 정해진다는 것과, 스크롤 초기화 관련 문제가 있다는 것을 기억해 두어야 할것 같다.
