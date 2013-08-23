require 'yajl'

namespace :segmentio do
  task :load, [:path] => :environment do |t, args|
    abort("Path required") if args.path.blank?

    project = Project.find_by_name("segmentio")
    project.sky_client.delete_table(project.sky_table)
    project.create_sky_table()

    filenames = Dir.glob("#{args.path}/**/*").reject{|f| File.directory?(f)}
    filenames.each do |filename|
      puts filename

      Yajl::Parser.parse(File.new(filename)) do |event|
        timestamp = DateTime.iso8601(event["timestamp"])
        anonymous = event["userId"].blank?
        tracking_id = event["userId"]
        internal_tracking_id = "~#{event["sessionId"]}"
        id = anonymous ? internal_tracking_id : tracking_id
        
        # Skip test data.
        if id == "serverside-vs-client-side-test"
          print "."
          next
        end

        traits = event["traits"] || {}
        traits.delete_if {|k,v| v.is_a?(Hash) || v.is_a?(Array)}
        traits.delete("created")

        properties = event["properties"] || {}
        if !event["event"].blank?
          properties["__channel__"] = (event["channel"] == "client" ? "__web__" : "__server__")
          properties["__action__"] = event["event"]
          properties["__anonymous__"] = anonymous
          if properties.has_key?("url")
            properties["__url__"] = properties.delete("url").to_s.gsub(/#.+$/, "")
          end
        end
        properties.delete_if {|k,v| v.is_a?(Hash) || v.is_a?(Array)}
        properties.delete("userAgent")

        next if traits.empty? && properties.empty?

        output = {id:id, timestamp:timestamp.iso8601(), properties:properties, traits:traits}
        print output.to_json, "\n"

        if !tracking_id.blank? && internal_tracking_id != "~"
          project.sky_table.merge_objects(tracking_id, internal_tracking_id)
        end

        project.track(id, traits, properties)
      end
    end
  end
end
