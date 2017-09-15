import * as blinkDiff from "blink-diff";
import { ImageOptions} from "./image-options";

export class ImageHelper {

    public imageOutputLimit() {
        return ImageOptions.outputAll;
    }

    public thresholdType() {
        return ImageOptions.pixel;
    }

    public threshold() {
        return 0.1; // 0.1 percent; 500 percent
    }

    public delta() {
        return 20;
    }

    public cropImageA() {
        return { x: 0, y: 40 }; // Android = 35, iOS = 40
    }

    public cropImageB() {
        return { x: 0, y: 40 }; // Android = 35, iOS = 40
    }

    public verbose() {
        return false;
    }

    private runDiff(diffOptions: blinkDiff, diffImage: string) {
        return new Promise<boolean>((resolve, reject) => {
            diffOptions.run(function (error, result) {
                if (error) {
                    throw error;
                } else {
                    let message;
                    let resultCode = diffOptions.hasPassed(result.code);
                    if (resultCode) {
                        message = "Screen compare passed!";
                        console.log(message);
                        console.log('Found ' + result.differences + ' differences.');
                        return resolve(true);
                    } else {
                        message = "Screen compare failed!"
                        console.log(message);
                        console.log('Found ' + result.differences + ' differences.');
                        console.log('Diff image: ' + diffImage);
                        return resolve(false);
                    }
                }
            });
        });
    }

    public compareImages(actual: string, expected: string, output: string, valueThreshold: number = this.threshold(), typeThreshold: any = ImageOptions.percent) {
        let diff = new blinkDiff({
            imageAPath: actual,
            imageBPath: expected,
            imageOutputPath: output,
            imageOutputLimit: this.imageOutputLimit(),
            thresholdType: typeThreshold,
            threshold: valueThreshold,
            delta: this.delta(),
            cropImageA: this.cropImageA(),
            cropImageB: this.cropImageB(),
            verbose: this.verbose(),
        });

        return this.runDiff(diff, output);
    }
}
