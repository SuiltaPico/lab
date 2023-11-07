import { createEffect, createSignal, on, onMount } from "solid-js";
import Button, { PrimaryButton, SecondlyButton } from "../../base/Button";
import { Column, Row } from "../../base/Flex";
import { FileUpload } from "../../input/FileUpload";
import { Icon } from "@iconify-icon/solid";
import { isNil } from "../../../lib/utils/nil";
import { LTTB } from "downsample";
// import * as echarts from "echarts";
import WaveSurfer from "wavesurfer.js";
import { WaveFile } from "wavefile";
import to_wav from "audiobuffer-to-wav";

export function DTransform() {
  const [ac, set_ac] = createSignal<OfflineAudioContext | undefined>();

  const [src_sample_rate, set_src_sample_rate] = createSignal<number>(44100);
  const [src_file_input, set_src_file_input] = createSignal<File | undefined>();
  const [latest_src_file_revoker, set_latest_src_file_revoker] = createSignal<
    (() => void) | undefined | null
  >();
  const [src_file_url, set_src_file_url] = createSignal<string>("");
  /** [-1, 1] */
  const [src_file_error, set_src_file_error] = createSignal<string>("");
  const [src_buffer, set_src_buffer] = createSignal<AudioBuffer | undefined>();

  const [target_file_url, set_target_file_url] = createSignal<string>("");
  const [latest_target_file_revoker, set_latest_target_file_revoker] =
    createSignal<(() => void) | undefined | null>();

  createEffect(
    on(
      [src_file_input, src_sample_rate],
      async ([source_file, src_sample_rate]) => {
        let audio_context = ac();
        if (isNil(audio_context)) {
          audio_context = new OfflineAudioContext({
            sampleRate: src_sample_rate,
            length: src_sample_rate * 2,
          });
          set_ac(audio_context);
        }

        if (!source_file) {
          set_src_file_url("");
          set_src_buffer();
          return;
        }

        const url = URL.createObjectURL(source_file);
        set_latest_src_file_revoker(() => () => URL.revokeObjectURL(url));
        set_src_file_url(url);

        console.log("解码中……");

        const buffer = await audio_context
          .decodeAudioData(await source_file.arrayBuffer())
          .catch((it) => {
            set_src_file_error(it.message);
            set_src_buffer();
            return;
          });

        console.log("解码完成。");

        if (buffer) {
          set_src_buffer(buffer);
          console.log(buffer.getChannelData(0));
        }
      },
      {
        defer: true,
      },
    ),
  );

  createEffect(
    on(latest_src_file_revoker, (curr, prev) => {
      if (curr === null) return;
      prev?.();
    }),
  );

  createEffect(
    on(latest_target_file_revoker, (curr, prev) => {
      if (curr === null) return;
      prev?.();
    }),
  );

  createEffect(
    on(src_buffer, (buffer) => {}, {
      defer: true,
    }),
  );

  onMount(() => {
    // src_echarts_inst = echarts.init(src_echarts_container, undefined, {
    //   renderer: "canvas",
    // });
  });

  function generate_handle_d_transfrom(option: { inverse?: boolean }) {
    return () => {
      const _src_buffer = src_buffer();
      const _ac = ac();
      if (!_src_buffer || !_ac) return;

      const channel_num = _src_buffer.numberOfChannels;
      const sample_rate = _src_buffer.sampleRate;

      const _target_buffer = _ac.createBuffer(
        channel_num,
        _src_buffer.length,
        sample_rate,
      );

      console.time("transfrom");

      if (!option.inverse) {
        // 0: f[0] = a[0]
        // 1~inf: f[x] = a[x] - a[x-1]
        for (let ci = 0; ci < channel_num; ci++) {
          const src_channel = _src_buffer.getChannelData(ci);
          const target_channel = _target_buffer.getChannelData(ci);
          target_channel[0] = src_channel[0];
          for (let i = 1; i < src_channel.length; i++) {
            target_channel[i] = src_channel[i] - src_channel[i - 1];
          }
        }
      } else {
        // 0: a[0] = f[0]
        // 1~inf: a[x] = f[x] + a[x-1]
        for (let ci = 0; ci < channel_num; ci++) {
          const src_channel = _src_buffer.getChannelData(ci);
          const target_channel = _target_buffer.getChannelData(ci);
          target_channel[0] = src_channel[0];
          for (let i = 1; i < src_channel.length; i++) {
            target_channel[i] = src_channel[i] + target_channel[i - 1];
          }
        }
      }

      console.timeEnd("transfrom");

      const target_channels: Float32Array[] = [];
      for (let ci = 0; ci < channel_num; ci++) {
        target_channels.push(_target_buffer.getChannelData(ci));
      }

      console.log(sample_rate);

      console.time("build wav");
      const target_buffer = to_wav(_target_buffer, {
        float32: true,
      });
      // const wav_file = new WaveFile();
      // wav_file.fromScratch(channel_num, sample_rate, "32f", target_channels);
      // const target_buffer = wav_file.toBuffer();
      console.timeEnd("build wav");

      const url = URL.createObjectURL(
        new Blob([target_buffer], {
          type: "audio/wav",
        }),
      );
      set_latest_target_file_revoker(() => () => URL.revokeObjectURL(url));
      set_target_file_url(url);
    };
  }

  // async function handle_target_as_src() {
  //   const target_buffer = await (await fetch(target_file_url())).arrayBuffer();
  //   set_src_file_input(
  //     new File([new Blob([target_buffer])], "来自转换目标.wav"),
  //   );
  //   set_latest_src_file_revoker(() => latest_target_file_revoker());
  //   set_latest_target_file_revoker(null);
  //   set_target_file_url("");
  // }

  return (
    <div class="flex w-[100%] justify-center bg-gray-100">
      <Column gap={6} class="w-[98%] p-4 md:w-[80%] xl:w-[60%]">
        <Row class="text-3xl font-bold">D 转换</Row>

        <Row gap={8} class="flex-wrap items-start">
          <Column gap={4} class="grow rounded bg-gray-50 px-6 py-6 shadow-lg">
            <Row class="items-center gap-1 text-xl">
              <Icon icon="mdi:waveform" class="text-2xl"></Icon>
              <Row class="">转换源</Row>
            </Row>
            <Row>
              <label for="src_sample_rate">采样率</label>
              <select
                id="src_sample_rate"
                oninput={(e) => {
                  const sample_rate = parseInt(e.target.value);
                  const audio_context = new OfflineAudioContext({
                    sampleRate: sample_rate,
                    length: sample_rate * 2,
                  });
                  set_ac(audio_context);
                  set_src_sample_rate(sample_rate);
                }}
              >
                <option value="44100">44.1 kHz</option>
                <option value="48000">48 kHz</option>
                <option value="88200">88.2 kHz</option>
                <option value="96000">96 kHz</option>
              </select>
            </Row>
            <Column>
              <FileUpload
                onChange={(e) => {
                  console.log(e.target.files);
                  set_src_file_input(e.target.files?.[0]);
                }}
              ></FileUpload>
              <div>{src_file_error()}</div>
            </Column>
            <Row>
              <audio class="grow" src={src_file_url()} controls></audio>
            </Row>
            <Row gap={2} class="mt-4">
              <PrimaryButton onClick={generate_handle_d_transfrom({})}>
                <Row gap={1} class="items-center">
                  <Icon class="text-lg" icon="mdi:play"></Icon>
                  <Row>D转换</Row>
                </Row>
              </PrimaryButton>
              <SecondlyButton>
                <Row
                  gap={1}
                  class="items-center"
                  onClick={generate_handle_d_transfrom({ inverse: true })}
                >
                  <Icon class="text-lg" icon="mdi:play"></Icon>
                  <Row>逆向D转换</Row>
                </Row>
              </SecondlyButton>
            </Row>
          </Column>

          <Column gap={4} class="grow rounded bg-gray-50 px-6 py-6 shadow-lg">
            <Row class="items-center gap-1 text-xl">
              <Icon icon="mdi:waveform" class="text-2xl"></Icon>
              <Row class="">转换目标</Row>
            </Row>
            <Row>
              <audio class="grow" src={target_file_url()} controls></audio>
            </Row>
            <Row gap={2} class="mt-4">
              <PrimaryButton
                onClick={() => {
                  var tempLink = document.createElement("a");
                  tempLink.style.display = "none";
                  tempLink.href = target_file_url();
                  tempLink.setAttribute("download", target_file_url() + ".wav");

                  if (typeof tempLink.download === "undefined") {
                    tempLink.setAttribute("target", "_blank");
                  }

                  tempLink.click();
                }}
              >
                <Row gap={1} class="items-center">
                  <Icon class="text-lg" icon="mdi:export"></Icon>
                  <Row>导出</Row>
                </Row>
              </PrimaryButton>
              {/* <Button onClick={handle_target_as_src}>
                <Row gap={1} class="items-center">
                  <Icon class="text-lg" icon="mdi:undo-variant"></Icon>
                  <Row>作为转换源</Row>
                </Row>
              </Button> */}
            </Row>
          </Column>
        </Row>
      </Column>
    </div>
  );
}
